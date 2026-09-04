"use client";

import {
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

const CELL_SIZE = 12;
const STITCH_SIZE = 8;
const OVERSCAN = 72;
const REVEAL_DURATION = 2600;
const SCROLL_CLEAR_DURATION = 280;
const SCROLL_REASSEMBLE_DURATION = 900;
const SCROLL_SETTLE_DELAY = 340;
const MOTIF_CORE_SIZE = 13;
const MOTIF_TILE_SIZE = 21;
const MOTIF_PADDING = (MOTIF_TILE_SIZE - MOTIF_CORE_SIZE) / 2;

// The widest run in the pattern is the nine cells between two neighbouring
// medallions. Reaching any less would leave the lattice as disconnected
// islands and the growth could never cross from one medallion to the next.
const REACH_RADIUS = CELL_SIZE * 9.7;
// A long reach costs far more than its length, so the thread keeps running
// along the embroidery it is already on and throws a single tendril across a
// gap only once there is nothing nearer left to stitch. This is what gives the
// growth its root shape instead of a plain circular front.
const LEAP_PENALTY = 4;
// Split of one stitch's own formation: the thread runs out first, the knot
// ties itself over what is left.
const THREAD_SHARE = 0.55;
const KNOT_DELAY = 0.4;
// Share of the whole reveal a single stitch takes to form.
const GROW_WINDOW = 0.14;
const THREAD_ALPHA = 0.055;
const KNOT_ALPHA = [0.085, 0.05];

export const GLOBAL_BACKGROUND_REVEAL_EVENT =
  "bgsnl:global-background-reveal";

const clamp = (minimum, value, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edgeStart, edgeEnd, value) => {
  const progress = clamp(0, (value - edgeStart) / (edgeEnd - edgeStart), 1);

  return progress * progress * (3 - 2 * progress);
};

const easeOut = (progress) => 1 - Math.pow(1 - progress, 2.2);

// The reveal runs on a much gentler curve than the scroll transitions do: a
// sharp ease-out finishes three quarters of the lattice in the first half of
// the animation, which reads as a wipe rather than as something growing.
const easeGrowth = (progress) => 1 - Math.pow(1 - progress, 1.35);

const motifAt = (x, y) => {
  const motifX = (x % MOTIF_TILE_SIZE) - MOTIF_PADDING;
  const motifY = (y % MOTIF_TILE_SIZE) - MOTIF_PADDING;

  if (
    motifX < 0 ||
    motifY < 0 ||
    motifX >= MOTIF_CORE_SIZE ||
    motifY >= MOTIF_CORE_SIZE
  ) {
    return null;
  }

  const center = (MOTIF_CORE_SIZE - 1) / 2;
  const distance = Math.abs(motifX - center) + Math.abs(motifY - center);

  if (distance === center) return "G";
  if (distance === center - 1) return "R";
  if (distance === 2 || distance === 0) return "G";
  return null;
};

const readColor = (name, fallback) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
};

// Stable per-stitch variation on how eagerly a thread is taken up, so no two
// runs advance at quite the same rate and the lattice never grows as a clean
// machine-printed ring.
const wobble = (index) => {
  const value = Math.sin(index * 12.9898) * 43758.5453;

  return 0.85 + 0.3 * (value - Math.floor(value));
};

// Binary heap keyed by cost. A re-sorted frontier array would be simpler, but
// the lattice carries several thousand stitches on a desktop viewport and this
// runs again on every resize.
const createQueue = () => {
  const indices = [];
  const costs = [];

  const swap = (a, b) => {
    const index = indices[a];
    const cost = costs[a];

    indices[a] = indices[b];
    costs[a] = costs[b];
    indices[b] = index;
    costs[b] = cost;
  };

  return {
    get size() {
      return indices.length;
    },
    push(index, cost) {
      indices.push(index);
      costs.push(cost);

      let child = indices.length - 1;

      while (child > 0) {
        const parent = (child - 1) >> 1;
        if (costs[parent] <= costs[child]) break;
        swap(parent, child);
        child = parent;
      }
    },
    pop() {
      const top = indices[0];

      swap(0, indices.length - 1);
      indices.pop();
      costs.pop();

      let parent = 0;

      for (;;) {
        const left = parent * 2 + 1;
        const right = left + 1;
        let smallest = parent;

        if (left < costs.length && costs[left] < costs[smallest]) {
          smallest = left;
        }
        if (right < costs.length && costs[right] < costs[smallest]) {
          smallest = right;
        }
        if (smallest === parent) break;

        swap(parent, smallest);
        parent = smallest;
      }

      return top;
    },
  };
};

/**
 * Grows the whole lattice out of a single seed stitch nearest the middle of
 * the viewport: Dijkstra across every stitch that lies within reach of another,
 * so each one comes away knowing both the stitch it grew from and the moment
 * the thread arrived. Painting that tree back in cost order is what knits the
 * pattern into place — a run of thread, then the knot at its end — instead of
 * fading the whole sheet up at once.
 */
const weave = (stitches, width, height, centerX, centerY) => {
  const count = stitches.length;
  if (!count) return;

  const bucketColumns = Math.max(1, Math.ceil(width / REACH_RADIUS));
  const bucketRows = Math.max(1, Math.ceil(height / REACH_RADIUS));
  const buckets = Array.from(
    { length: bucketColumns * bucketRows },
    () => []
  );
  const columnOf = (x) =>
    clamp(0, Math.floor(x / REACH_RADIUS), bucketColumns - 1);
  const rowOf = (y) => clamp(0, Math.floor(y / REACH_RADIUS), bucketRows - 1);

  let seed = 0;
  let seedDistance = Infinity;

  stitches.forEach((stitch, index) => {
    buckets[rowOf(stitch.y) * bucketColumns + columnOf(stitch.x)].push(index);

    const distance = Math.hypot(stitch.x - centerX, stitch.y - centerY);

    if (distance < seedDistance) {
      seedDistance = distance;
      seed = index;
    }
  });

  const cost = new Float64Array(count).fill(Infinity);
  const settled = new Uint8Array(count);
  const queue = createQueue();

  let settledCount = 0;

  const relax = (index) => {
    const stitch = stitches[index];
    const column = columnOf(stitch.x);
    const row = rowOf(stitch.y);

    for (let stepY = -1; stepY <= 1; stepY += 1) {
      const neighbourRow = row + stepY;
      if (neighbourRow < 0 || neighbourRow >= bucketRows) continue;

      for (let stepX = -1; stepX <= 1; stepX += 1) {
        const neighbourColumn = column + stepX;
        if (neighbourColumn < 0 || neighbourColumn >= bucketColumns) continue;

        const bucket = buckets[neighbourRow * bucketColumns + neighbourColumn];

        for (let slot = 0; slot < bucket.length; slot += 1) {
          const candidate = bucket[slot];
          if (settled[candidate]) continue;

          const other = stitches[candidate];
          const reach = Math.hypot(other.x - stitch.x, other.y - stitch.y);
          if (reach === 0 || reach > REACH_RADIUS) continue;

          const stretch = reach / REACH_RADIUS;
          const next =
            cost[index] +
            reach *
              (1 + LEAP_PENALTY * stretch * stretch * stretch) *
              wobble(candidate);

          if (next < cost[candidate]) {
            cost[candidate] = next;
            other.link = index;
            queue.push(candidate, next);
          }
        }
      }
    }
  };

  const drain = () => {
    while (queue.size) {
      const index = queue.pop();
      if (settled[index]) continue;

      settled[index] = 1;
      settledCount += 1;
      relax(index);
    }
  };

  cost[seed] = 0;
  queue.push(seed, 0);
  drain();

  // On a phone the cleared middle is nearly as wide as the viewport and cuts
  // the lattice clean in two: no stitch on the far side is within reach of
  // anything the thread has taken. Left alone, that whole half would snap in
  // at the end of the reveal. Instead the growth is carried over the void at
  // its narrowest crossing and picks up again there. It is a jump in the
  // order only — `link` stays unset, so no run is drawn across, since a thread
  // there would be a line straight through the page content.
  while (settledCount < count) {
    let carryFrom = -1;
    let carryTo = -1;
    let carryGap = Infinity;

    for (let index = 0; index < count; index += 1) {
      if (settled[index]) continue;

      const stitch = stitches[index];

      for (let other = 0; other < count; other += 1) {
        if (!settled[other]) continue;

        const gap = Math.hypot(
          stitches[other].x - stitch.x,
          stitches[other].y - stitch.y
        );

        if (gap < carryGap) {
          carryGap = gap;
          carryFrom = other;
          carryTo = index;
        }
      }
    }

    if (carryTo < 0) break;

    cost[carryTo] = cost[carryFrom] + carryGap * LEAP_PENALTY;
    queue.push(carryTo, cost[carryTo]);
    drain();
  }

  let longest = 0;

  for (let index = 0; index < count; index += 1) {
    if (cost[index] !== Infinity && cost[index] > longest) {
      longest = cost[index];
    }
  }

  const span = longest || 1;

  for (let index = 0; index < count; index += 1) {
    // Anything the thread never reached — a stitch stranded by the cleared
    // middle, say — is left to the very end of the reveal and simply ties
    // itself on with no run leading in.
    stitches[index].birth =
      cost[index] === Infinity
        ? 1 - GROW_WINDOW
        : (cost[index] / span) * (1 - GROW_WINDOW);
  }
};

export default function GlobalBackground({
  initiallyRevealed = false,
  onReady,
}) {
  const canvasRef = useRef(null);
  const animationControllerRef = useRef(null);
  const lastScrollPositionRef = useRef(0);
  const scrollSettleTimerRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (position) => {
    const controller = animationControllerRef.current;
    if (!controller || reducedMotion) return;

    const scrollDelta = position - lastScrollPositionRef.current;
    lastScrollPositionRef.current = position;
    if (Math.abs(scrollDelta) < 0.5) return;

    const direction = Math.sign(scrollDelta);
    const strength = Math.min(1, Math.abs(scrollDelta) / 28);
    controller.clear(direction, strength);

    window.clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = window.setTimeout(() => {
      animationControllerRef.current?.reassemble();
    }, SCROLL_SETTLE_DELAY);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let animationFrame = 0;
    let resizeTimer = 0;
    let revealStartedAt = 0;
    let revealProgress = reducedMotion || initiallyRevealed ? 1 : 0;
    let hasDiscovered = Boolean(reducedMotion || initiallyRevealed);
    let hasReportedReady = false;
    let plan;
    let motion = {
      duration: 0,
      fromLead: 0,
      fromStrength: 0,
      lead: 0,
      startedAt: 0,
      strength: 0,
      targetLead: 0,
      targetStrength: 0,
    };

    const prepareStitches = () => {
      const width = window.innerWidth + OVERSCAN * 2;
      const height = window.innerHeight + OVERSCAN * 2;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const palette = [
        readColor("--site-thread-primary", "#017363"),
        readColor("--site-thread-secondary", "#9e0d33"),
      ];
      const columns = Math.ceil(width / CELL_SIZE) + 1;
      const rows = Math.ceil(height / CELL_SIZE) + 1;
      const centerX = width / 2;
      const centerY = OVERSCAN + window.innerHeight * 0.46;
      const clearRadiusX = clamp(250, width * 0.225, 390);
      const clearRadiusY = clamp(190, window.innerHeight * 0.285, 300);
      const stitches = [];

      for (let column = 0; column < columns; column += 1) {
        for (let row = 0; row < rows; row += 1) {
          const stitch = motifAt(column, row);
          if (!stitch) continue;

          // Knots are drawn from their middle now — they have to be able to
          // grow out of nothing and shrink back into it — so the cell's
          // top-left corner is no longer the anchor.
          const x = column * CELL_SIZE + STITCH_SIZE / 2;
          const y = row * CELL_SIZE + STITCH_SIZE / 2;
          const clearDistance = Math.hypot(
            (x - centerX) / clearRadiusX,
            (y - centerY) / clearRadiusY
          );
          const fade = smoothstep(0.64, 1, clearDistance);

          // Below this the knot is a fraction of a pixel across and the run
          // into it is not worth walking the lattice for.
          if (fade <= 0.06) continue;

          stitches.push({
            birth: 0,
            fade,
            link: -1,
            thread: stitch === "G" ? 0 : 1,
            x,
            y,
          });
        }
      }

      weave(stitches, width, height, centerX, centerY);

      return {
        centerX,
        centerY,
        clearRadiusX,
        clearRadiusY,
        height,
        palette,
        stitches,
        width,
      };
    };

    const sampleMotion = (timestamp) => {
      if (!motion.duration) return false;

      const progress = clamp(
        0,
        (timestamp - motion.startedAt) / motion.duration,
        1
      );
      const easedProgress = easeOut(progress);

      motion.lead =
        motion.fromLead +
        (motion.targetLead - motion.fromLead) * easedProgress;
      motion.strength =
        motion.fromStrength +
        (motion.targetStrength - motion.fromStrength) * easedProgress;

      if (progress >= 1) motion.duration = 0;
      return progress < 1;
    };

    const paint = (currentPlan, progress) => {
      const {
        centerX,
        centerY,
        clearRadiusX,
        clearRadiusY,
        height,
        palette,
        stitches,
        width,
      } = currentPlan;

      context.clearRect(0, 0, width, height);

      // Everything is batched into four paths — a run and a knot path per
      // thread colour — because the alternative is a fillStyle and a stroke
      // call per stitch, several thousand times a frame.
      const runs = [new Path2D(), new Path2D()];
      const knots = [new Path2D(), new Path2D()];
      const isClearing = motion.strength > 0.001;
      const clearanceRadius = motion.strength * 1.18;

      for (let index = 0; index < stitches.length; index += 1) {
        const stitch = stitches[index];
        let formed = clamp(0, (progress - stitch.birth) / GROW_WINDOW, 1);

        if (isClearing) {
          const clearanceDistance = Math.hypot(
            (stitch.x - centerX) / (clearRadiusX * 2.2),
            (stitch.y - (centerY + motion.lead)) / clearRadiusY
          );

          // Scrolling drives the same number that the reveal does, so the
          // middle of the page unpicks itself stitch by stitch on the way out
          // and knits itself back the same way once the page settles.
          formed = Math.min(
            formed,
            smoothstep(
              clearanceRadius - 0.08,
              clearanceRadius + 0.08,
              clearanceDistance
            )
          );
        }

        if (formed <= 0.02) continue;

        // The run of thread pays out first and stops short where the pattern
        // is thinning towards the cleared middle, which frays that edge
        // instead of cutting it.
        const reach =
          easeOut(clamp(0, formed / THREAD_SHARE, 1)) * stitch.fade;

        if (stitch.link >= 0 && reach > 0.02) {
          const anchor = stitches[stitch.link];

          runs[stitch.thread].moveTo(anchor.x, anchor.y);
          runs[stitch.thread].lineTo(
            anchor.x + (stitch.x - anchor.x) * reach,
            anchor.y + (stitch.y - anchor.y) * reach
          );
        }

        const tied = easeOut(
          clamp(0, (formed - KNOT_DELAY) / (1 - KNOT_DELAY), 1)
        );
        if (tied <= 0.01) continue;

        const size = STITCH_SIZE * stitch.fade * tied;

        knots[stitch.thread].rect(
          stitch.x - size / 2,
          stitch.y - size / 2,
          size,
          size
        );
      }

      context.lineCap = "round";
      context.lineWidth = 1;

      for (let thread = 0; thread < palette.length; thread += 1) {
        context.strokeStyle = palette[thread];
        context.globalAlpha = THREAD_ALPHA;
        context.stroke(runs[thread]);

        context.fillStyle = palette[thread];
        context.globalAlpha = KNOT_ALPHA[thread];
        context.fill(knots[thread]);
      }

      context.globalAlpha = 1;
    };

    const frame = (timestamp) => {
      animationFrame = 0;
      let keepAnimating = sampleMotion(timestamp);

      if (revealProgress < 1) {
        if (!hasDiscovered) {
          paint(plan, 0);
          return;
        }

        revealStartedAt ||= timestamp;
        const elapsed = (timestamp - revealStartedAt) / REVEAL_DURATION;
        revealProgress = easeGrowth(clamp(0, elapsed, 1));
        keepAnimating = revealProgress < 1 || keepAnimating;
      }

      paint(plan, revealProgress);

      if (!hasReportedReady && revealProgress >= 1) {
        hasReportedReady = true;
        onReady?.();
      }

      if (keepAnimating) animationFrame = requestAnimationFrame(frame);
    };

    const requestPaint = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(frame);
    };

    const transitionMotion = (targetLead, targetStrength, duration) => {
      const timestamp = performance.now();
      sampleMotion(timestamp);
      motion = {
        ...motion,
        duration,
        fromLead: motion.lead,
        fromStrength: motion.strength,
        startedAt: timestamp,
        targetLead,
        targetStrength,
      };
      requestPaint();
    };

    animationControllerRef.current = {
      clear(direction, strength) {
        if (!hasDiscovered) return;

        const leadDistance =
          plan.clearRadiusY * (0.95 + strength * 0.5);
        transitionMotion(
          direction * leadDistance,
          1,
          SCROLL_CLEAR_DURATION
        );
      },
      reassemble() {
        transitionMotion(0, 0, SCROLL_REASSEMBLE_DURATION);
      },
    };

    const render = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      plan = prepareStitches();
      requestPaint();
    };

    const reveal = () => {
      if (hasDiscovered) return;

      hasDiscovered = true;
      revealProgress = reducedMotion || initiallyRevealed ? 1 : 0;
      revealStartedAt = 0;
      requestPaint();
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 160);
    };

    render();
    window.addEventListener(GLOBAL_BACKGROUND_REVEAL_EVENT, reveal, {
      once: true,
    });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      animationControllerRef.current = null;
      window.clearTimeout(resizeTimer);
      window.clearTimeout(scrollSettleTimerRef.current);
      window.removeEventListener(GLOBAL_BACKGROUND_REVEAL_EVENT, reveal);
      window.removeEventListener("resize", handleResize);
    };
  }, [initiallyRevealed, onReady, reducedMotion]);

  return (
    <div className="global-site-background" aria-hidden="true">
      <canvas ref={canvasRef} className="global-site-background__stitches" />
    </div>
  );
}

GlobalBackground.propTypes = {
  initiallyRevealed: PropTypes.bool,
  onReady: PropTypes.func,
};

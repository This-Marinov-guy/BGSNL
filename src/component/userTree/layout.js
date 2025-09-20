// Organic layout and collision separation exported as pure functions
export const MAX_DEPTH = 100;

export function levelCap(level) {
  // Increased capacity to handle 114+ users
  if (level === 1) return 1;
  if (level === 2) return 8; // was 4
  if (level === 3) return 16; // was 8
  if (level === 4) return 32; // was 16
  if (level === 5) return 64; // new level
  return Math.pow(2, level);
}

export function perNodeChildCapForLevel(level) {
  // Increased child limits
  if (level === 1) return 8; // was 4 - root can have 8 children
  if (level === 2) return 4; // was 2 - level 2 nodes can have 4 children
  if (level === 3) return 3; // was 2 - level 3 nodes can have 3 children
  if (level === 4) return 2; // level 4 nodes can have 2 children
  return 2;
}

export function computeOrganic(root, opts = {}) {
  const depthGap = opts.depthGap ?? 220; // NOTE: increase space
  const centerX = opts.centerX ?? 700;
  const rng = opts.rng ?? (() => Math.random());

  root.depth = 0;
  root.x = centerX;
  root.y = 0;

  const L2 = root.children || [];

  L2.forEach((n) => (n.depth = 1));

  const n2 = L2.length;
  const span2 = (180 * Math.PI) / 180; // Increased span for more children
  const angles2 =
    n2 <= 1
      ? [0]
      : Array.from(
          { length: n2 },
          (_, i) => -span2 / 2 + (span2 * i) / (n2 - 1)
        );
  const r2 = depthGap * 1;

  for (let i = 0; i < n2; i++) {
    const a = angles2[i];
    const node = L2[i];
    node.x = root.x + Math.sin(a) * r2;
    node.y = root.y + Math.cos(a) * r2;
    node.angle = a;
  }

  const r3 = depthGap * 2;

  L2.forEach((p, idx) => {
    const children = p.children || [];
    children.forEach((c) => (c.depth = 2));
    const count = children.length;
    if (!count) return;
    const aParent = p.angle ?? angles2[Math.min(idx, angles2.length - 1)];
    const localSpan =
      (count <= 4 ? 40 : Math.min(70, 25 + count * 8)) * (Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = aParent - localSpan / 2 + localSpan * t;
      const child = children[i];
      child.x = root.x + Math.sin(a) * r3;
      child.y = root.y + Math.cos(a) * r3;
      child.angle = a;
    }
  });

  const r4 = depthGap * 3;
  const L3 = [];

  L2.forEach((p) => p.children?.forEach((c) => L3.push(c)));
  L3.forEach((p) => {
    const children = p.children || [];
    children.forEach((c) => (c.depth = 3));
    const count = children.length;
    if (!count) return;
    const aParent = p.angle ?? 0;
    const localSpan =
      (count <= 3 ? 30 : Math.min(50, 18 + count * 6)) * (Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = aParent - localSpan / 2 + localSpan * t;
      const child = children[i];
      child.x = root.x + Math.sin(a) * r4;
      child.y = root.y + Math.cos(a) * r4;
      child.angle = a;
    }
  });

  const r5 = depthGap * 4;
  const L4 = [];

  L3.forEach((p) => p.children?.forEach((c) => L4.push(c)));
  L4.forEach((p) => {
    const children = p.children || [];
    children.forEach((c) => (c.depth = 4));
    const count = children.length;
    if (!count) return;
    const aParent = p.angle ?? 0;
    const localSpan =
      (count <= 2 ? 25 : Math.min(42, 15 + count * 5)) * (Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = aParent - localSpan / 2 + localSpan * t;
      const child = children[i];
      child.x = root.x + Math.sin(a) * r5;
      child.y = root.y + Math.cos(a) * r5;
      child.angle = a;
    }
  });

  // Add Level 5 positioning
  const r6 = depthGap * 5;
  const L5 = [];

  L4.forEach((p) => p.children?.forEach((c) => L5.push(c)));
  L5.forEach((p) => {
    const children = p.children || [];
    children.forEach((c) => (c.depth = 5));
    const count = children.length;
    if (!count) return;
    const aParent = p.angle ?? 0;
    const localSpan =
      (count <= 2 ? 20 : Math.min(35, 12 + count * 4)) * (Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = aParent - localSpan / 2 + localSpan * t;
      const child = children[i];
      child.x = root.x + Math.sin(a) * r6;
      child.y = root.y + Math.cos(a) * r6;
      child.angle = a;
    }
  });

  // Separation (updated for 5 levels)
  let maxDepthGlobal = 0;
  (function detect(n) {
    maxDepthGlobal = Math.max(maxDepthGlobal, n.depth || 0);
    n.children?.forEach(detect);
  })(root);
  const all = [];
  (function collect(n) {
    all.push(n);
    n.children?.forEach(collect);
  })(root);
  const avatarR = 28;
  const keepOut = (n) => {
    const d = n.depth || 0;
    const gap = d === 0 ? 8 : d <= 2 ? 10 : 9; // NOTE: increase space
    const leafLen = d === 0 ? 28 : d === 1 ? 24 : d <= 3 ? 30 : 28;
    return avatarR + gap + leafLen;
  };
  for (let it = 0; it < 12; it++) {
    // More iterations for better separation
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      if (a === root) continue;
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        let d = Math.hypot(dx, dy);
        if (d === 0) {
          const eps = 0.8 + rng() * 0.4;
          a.x += 0.7071 * eps;
          a.y += 0.7071 * eps;
          b.x -= 0.7071 * eps;
          b.y -= 0.7071 * eps;
          continue;
        }
        const minPair = keepOut(a) + keepOut(b) + 3; // Slightly tighter
        if (d < minPair) {
          const push = (minPair - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          const aBias = 0.4 + ((a.depth || 0) / (maxDepthGlobal || 1)) * 0.6;
          const bBias = 0.4 + ((b.depth || 0) / (maxDepthGlobal || 1)) * 0.6;
          a.x += ux * push * aBias;
          a.y += uy * push * aBias;
          b.x -= ux * push * bBias;
          b.y -= uy * push * bBias;
        }
      }
    }
  }
}

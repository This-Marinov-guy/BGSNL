import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRng } from "./useSeededRng";
import PropTypes from "prop-types";
import AlumniUserModal from "./AlumniUserModal";

function branchPath(x1, y1, x2, y2, w1, w2) {
  const vx = x2 - x1,
    vy = y2 - y1;
  const len = Math.max(1, Math.hypot(vx, vy));
  const nx = -vy / len,
    ny = vx / len;
  const pLx = x1 + nx * (w1 / 2),
    pLy = y1 + ny * (w1 / 2);
  const pRx = x1 - nx * (w1 / 2),
    pRy = y1 - ny * (w1 / 2);
  const cLx = x2 + nx * (w2 / 2),
    cLy = y2 + ny * (w2 / 2);
  const cRx = x2 - nx * (w2 / 2),
    cRy = y2 - ny * (w2 / 2);
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2;
  const bulge = (w1 + w2) * 0.25;
  const mLx = mx + nx * bulge,
    mLy = my + ny * bulge;
  const mRx = mx - nx * bulge,
    mRy = my - ny * bulge;
  return `M ${pLx},${pLy} Q ${mLx},${mLy} ${cLx},${cLy} L ${cRx},${cRy} Q ${mRx},${mRy} ${pRx},${pRy} Z`;
}

function widthFor(node) {
  const leaves = Math.max(1, node.leafCount || 1);
  const depth = node.depth || 0;
  const base = 10 + Math.log2(leaves + 1) * 6;
  const atten = Math.max(0, base - depth * 1.2);
  return Math.max(6, Math.min(34, atten));
}

function computeLeafCounts(node) {
  if (!node.children || node.children.length === 0) {
    node.leafCount = 1;
    return 1;
  }
  node.leafCount = node.children.reduce(
    (sum, c) => sum + computeLeafCounts(c),
    0
  );
  return node.leafCount;
}

function tierName(tier) {
  if (!tier) return "standard";
  const n = parseInt(tier);
  if (n >= 4) return "platinum";
  if (n >= 3) return "gold";
  if (n >= 2) return "silver";
  if (n >= 1) return "bronze";
  return "standard";
}

function tierLabel(tier) {
  if (!tier) return "Standard Member";
  const n = parseInt(tier);
  if (n >= 4) return "Platinum Member";
  if (n >= 3) return "Gold Member";
  if (n >= 2) return "Silver Member";
  if (n >= 1) return "Bronze Member";
  return "Standard Member";
}

export default function Tree({ style, nodes = [], onUserClick }) {
  const seed = 1;
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const rng = useMemo(() => createRng(seed), [seed]);
  const svgRef = useRef(null);
  const onUserClickRef = useRef(onUserClick);

  useEffect(() => {
    onUserClickRef.current = onUserClick;
  }, [onUserClick]);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setSelectedUser(null);
    }, 300);
  };

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // Build tree from flat node list using parentId
    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, { ...n, children: [] }));

    let treeRoot = null;
    nodeMap.forEach((n) => {
      if (n.parentId == null) {
        treeRoot = n;
      } else {
        const parent = nodeMap.get(n.parentId);
        if (parent) parent.children.push(n);
      }
    });

    if (!treeRoot) return;
    computeLeafCounts(treeRoot);

    const container = svgRef.current;
    if (!container) return;
    container.innerHTML = "";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const gLinks = document.createElementNS(svg.namespaceURI, "g");
    const gLeaves = document.createElementNS(svg.namespaceURI, "g");
    const gNodes = document.createElementNS(svg.namespaceURI, "g");

    svg.appendChild(gLinks);
    svg.appendChild(gLeaves);
    svg.appendChild(gNodes);

    const defs = document.createElementNS(svg.namespaceURI, "defs");
    const grad = document.createElementNS(svg.namespaceURI, "linearGradient");

    grad.setAttribute("id", "branchGrad");
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");

    const stop1 = document.createElementNS(svg.namespaceURI, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("class", "tree-stop1");

    const stop2 = document.createElementNS(svg.namespaceURI, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("class", "tree-stop2");
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);

    const tiers = ["platinum", "gold", "silver", "bronze", "standard"];
    tiers.forEach((tier) => {
      const leafGrad = document.createElementNS(
        svg.namespaceURI,
        "linearGradient"
      );
      leafGrad.setAttribute("id", `leafGrad-${tier}`);
      leafGrad.setAttribute("x1", "0");
      leafGrad.setAttribute("y1", "0");
      leafGrad.setAttribute("x2", "0");
      leafGrad.setAttribute("y2", "1");

      const lg1 = document.createElementNS(svg.namespaceURI, "stop");
      lg1.setAttribute("offset", "0%");
      lg1.setAttribute("class", `tree-leaf-stop1-${tier}`);

      const lg2 = document.createElementNS(svg.namespaceURI, "stop");
      lg2.setAttribute("offset", "100%");
      lg2.setAttribute("class", `tree-leaf-stop2-${tier}`);

      leafGrad.appendChild(lg1);
      leafGrad.appendChild(lg2);
      defs.appendChild(leafGrad);
    });

    svg.appendChild(defs);

    const avatarR = 28;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth || 0), 0);
    const baseHeight = (maxDepth + 1) * 130 + 40;

    function adj(n) {
      return { x: n.x, y: baseHeight - n.y };
    }

    function renderNode(node, parent) {
      const pos = adj(node);
      const x = pos.x,
        y = pos.y;
      const isLevel2 = node.depth === 1;
      const isRoot = node.depth === 0;
      const isTerminal = !node.children || node.children.length === 0;
      const margin = isTerminal || isLevel2 || isRoot ? 130 : 60;

      minX = Math.min(minX, x - margin);
      minY = Math.min(minY, y - margin);
      maxX = Math.max(maxX, x + margin);
      maxY = Math.max(maxY, y + Math.max(80, margin));

      if (parent) {
        const p = adj(parent);
        const br = document.createElementNS(svg.namespaceURI, "path");
        br.setAttribute(
          "d",
          branchPath(p.x, p.y, x, y, widthFor(parent), widthFor(node))
        );
        br.setAttribute("class", "tree-branch");
        gLinks.appendChild(br);
      }

      const group = document.createElementNS(svg.namespaceURI, "g");
      group.setAttribute("transform", `translate(${x},${y})`);
      group.addEventListener("mouseenter", () =>
        group.classList.add("avatar-hover")
      );
      group.addEventListener("mouseleave", () =>
        group.classList.remove("avatar-hover")
      );
      gNodes.appendChild(group);

      const ring = document.createElementNS(svg.namespaceURI, "circle");
      ring.setAttribute("class", `avatar-ring avatar-ring-${tierName(node.tier)}`);
      ring.setAttribute("r", String(avatarR + 2));
      ring.setAttribute("cx", "0");
      ring.setAttribute("cy", "0");
      ring.setAttribute("pointer-events", "auto");
      group.appendChild(ring);

      const clipId = `clip-${node.id}`;
      const clipDefs = document.createElementNS(svg.namespaceURI, "defs");
      const clip = document.createElementNS(svg.namespaceURI, "clipPath");
      clip.setAttribute("id", clipId);

      const clipCircle = document.createElementNS(svg.namespaceURI, "circle");
      clipCircle.setAttribute("r", String(avatarR));
      clipCircle.setAttribute("cx", "0");
      clipCircle.setAttribute("cy", "0");
      clip.appendChild(clipCircle);
      clipDefs.appendChild(clip);
      group.appendChild(clipDefs);

      const img = document.createElementNS(svg.namespaceURI, "image");
      img.setAttribute("href", node.avatarUrl);

      const imgSize = avatarR * 2.5;
      img.setAttribute("x", String(-imgSize / 2));
      img.setAttribute("y", String(-imgSize / 2));
      img.setAttribute("width", String(imgSize));
      img.setAttribute("height", String(imgSize));
      img.setAttribute("clip-path", `url(#${clipId})`);
      img.setAttribute("pointer-events", "auto");
      img.setAttribute("preserveAspectRatio", "xMidYMid slice");
      img.style.cursor = "pointer";

      img.addEventListener("error", () => {
        img.setAttribute(
          "href",
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e5e7eb"/><text x="50" y="50" text-anchor="middle" dy=".35em" fill="%23666" font-size="24">👤</text></svg>'
        );
      });

      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const userData = {
          id: node.id,
          name: node.name,
          avatar: node.avatarUrl,
          tier: node.tier,
          quote: node.quote,
          joinDate: node.joinDate,
        };
        setSelectedUser(userData);
        setIsModalOpen(true);
        if (typeof onUserClickRef.current === "function") {
          onUserClickRef.current(userData);
        }
      });
      group.appendChild(img);

      const minCardWidth = 90;
      const charWidth = 6.5;
      const nameLen = node.name ? node.name.length : 0;
      const tLabel = tierLabel(node.tier);
      const maxLen = Math.max(nameLen, tLabel.length);
      const estWidth = Math.ceil(maxLen * charWidth) + 6;
      const cardWidth = Math.max(minCardWidth, estWidth);
      const cardHeight = 36;
      const cardX = -cardWidth / 2;
      const cardY = avatarR + 6;

      const cardRect = document.createElementNS(svg.namespaceURI, "rect");
      cardRect.setAttribute("x", String(cardX));
      cardRect.setAttribute("y", String(cardY));
      cardRect.setAttribute("width", String(cardWidth));
      cardRect.setAttribute("height", String(cardHeight));
      cardRect.setAttribute("rx", "6");
      cardRect.setAttribute("class", "node-label-card");
      group.appendChild(cardRect);

      const label = document.createElementNS(svg.namespaceURI, "text");
      label.setAttribute("class", "node-label");
      label.setAttribute("x", "0");
      label.setAttribute("y", String(avatarR + 22));

      const nameTspan = document.createElementNS(svg.namespaceURI, "tspan");
      nameTspan.setAttribute("x", "0");
      nameTspan.setAttribute("dy", "0");
      nameTspan.textContent = node.name;
      label.appendChild(nameTspan);

      const tierTspan = document.createElementNS(svg.namespaceURI, "tspan");
      tierTspan.setAttribute("x", "0");
      tierTspan.setAttribute("dy", "1.2em");
      tierTspan.setAttribute("class", "node-tier-label");
      tierTspan.textContent = tLabel;
      label.appendChild(tierTspan);

      group.appendChild(label);

      // Decorative leaves
      const totalLeaves = 60;
      const step = (Math.PI * 2) / totalLeaves;
      const gap = 2;
      const lenBase = isRoot ? 20 : isLevel2 ? 18 : 16;

      for (let i = 0; i < totalLeaves; i++) {
        const a = i * step + (rng() - 0.5) * step * 0.4;
        const tilt = a + (rng() - 0.5) * 0.3;
        const len = lenBase + rng() * 14;
        const width = 6 + rng() * 4;
        const baseX = x + Math.cos(tilt) * (avatarR + gap);
        const baseY = y + Math.sin(tilt) * (avatarR + gap);

        const stem = document.createElementNS(svg.namespaceURI, "path");
        const ex = baseX + Math.cos(tilt) * (len * 0.35);
        const ey = baseY + Math.sin(tilt) * (len * 0.35);
        stem.setAttribute("d", `M ${baseX},${baseY} L ${ex},${ey}`);
        stem.setAttribute("class", "tree-leaf-stem");
        stem.setAttribute("pointer-events", "none");
        gLeaves.appendChild(stem);

        const leaf = document.createElementNS(svg.namespaceURI, "path");
        const tipX = baseX + Math.cos(tilt) * len;
        const tipY = baseY + Math.sin(tilt) * len;
        const nX = -Math.sin(tilt),
          nY = Math.cos(tilt);
        const c1x = baseX + nX * width,
          c1y = baseY + nY * width;
        const c2x = baseX - nX * width,
          c2y = baseY - nY * width;

        leaf.setAttribute(
          "d",
          `M ${baseX},${baseY} Q ${c1x},${c1y} ${tipX},${tipY} Q ${c2x},${c2y} ${baseX},${baseY} Z`
        );
        leaf.setAttribute(
          "class",
          `tree-leaf tree-leaf-${tierName(node.tier)}`
        );
        leaf.setAttribute("pointer-events", "none");
        gLeaves.appendChild(leaf);
      }

      node.children?.forEach((c) => renderNode(c, node));
    }

    // Trunk
    const TRUNK_HEIGHT = 220,
      TRUNK_BOTTOM_MIN = 90,
      TRUNK_TOP_MIN = 40,
      TRUNK_WIDTH_SCALE = 1.5;
    const rootAdj = adj(treeRoot);
    const trunkStartY = rootAdj.y + TRUNK_HEIGHT;
    const wBottom = Math.max(
      TRUNK_BOTTOM_MIN,
      widthFor(treeRoot) * TRUNK_WIDTH_SCALE
    );
    const wTop = Math.max(
      TRUNK_TOP_MIN,
      widthFor(treeRoot) * (TRUNK_WIDTH_SCALE * 0.7)
    );
    const trunk = document.createElementNS(svg.namespaceURI, "path");
    trunk.setAttribute(
      "d",
      branchPath(
        rootAdj.x,
        trunkStartY,
        rootAdj.x,
        rootAdj.y,
        wBottom,
        wTop
      )
    );
    trunk.setAttribute("class", "tree-branch");
    gLinks.appendChild(trunk);

    renderNode(treeRoot);

    const width = maxX - minX;
    const height = maxY - minY;
    svg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    container.appendChild(svg);
  }, [nodes, rng]);

  return (
    <>
      <div className="tree-container-wrapper" style={style}>
        <div id="tree-container" ref={svgRef} />
      </div>

      <AlumniUserModal
        isOpen={isModalOpen}
        isClosing={isClosing}
        user={selectedUser}
        onClose={handleCloseModal}
      />
    </>
  );
}

Tree.propTypes = {
  style: PropTypes.object,
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string,
      tier: PropTypes.number,
      quote: PropTypes.string,
      joinDate: PropTypes.string,
      depth: PropTypes.number.isRequired,
      parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })
  ),
  onUserClick: PropTypes.func,
};

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRng } from "./useSeededRng";
import {
	computeOrganic,
	MAX_DEPTH,
	levelCap,
	perNodeChildCapForLevel,
} from "./layout";
import PropTypes from "prop-types";

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

function countByLevel(root) {
	const counts = {};
	(function walk(n, depth = 0) {
		const level = depth + 1;
		counts[level] = (counts[level] || 0) + 1;
		n.children?.forEach((c) => walk(c, depth + 1));
	})(root, 0);
	return counts;
}

// Modified to use actual users array
function addChild(parent, count, levelCounts, users, userIndexRef) {
	const pDepth = parent.depth ?? 0;
	const childDepth = pDepth + 1;
	if (childDepth > MAX_DEPTH) return 0;
	const childLevelNum = childDepth + 1;
	const cap = levelCap(childLevelNum);
	const currentAtLevel = levelCounts[childLevelNum] ?? 0;
	const canAddLevel = Math.max(0, cap - currentAtLevel);
	const parentLevelNum = pDepth + 1;
	const parentCap = perNodeChildCapForLevel(parentLevelNum);
	const canAddParent = Math.max(0, parentCap - (parent.children?.length || 0));
	const toAdd = Math.min(
		count,
		canAddLevel,
		canAddParent,
		users.length - userIndexRef.current
	);

	for (let i = 0; i < toAdd; i++) {
		if (userIndexRef.current >= users.length) break;
		parent.children = parent.children || [];
		const user = users[userIndexRef.current++];
		parent.children.push({
			id: user.id,
			name: user.name + " " + user.surname,
			avatarUrl: user.image,
			tier: user.tier,
			quote: user.quote,
			joinDate: user.joinDate,
			children: [],
			depth: childDepth,
		});
		levelCounts[childLevelNum] = (levelCounts[childLevelNum] || 0) + 1;
	}
	return toAdd;
}

function distributeChildren(parents, count, childDepth, users, userIndexRef) {
	let remaining = count;

	if (parents.length === 0 || remaining <= 0) return remaining;

	const parentLevelNum = childDepth;
	const capPerParent = perNodeChildCapForLevel(parentLevelNum);
	const hasSlot = (p) => (p.children?.length || 0) < capPerParent;
	let eligible = parents.filter(hasSlot);
	let idx = 0;

	while (
		remaining > 0 &&
		eligible.length > 0 &&
		userIndexRef.current < users.length
	) {
		const p = eligible[idx % eligible.length];
		const levelCounts = countByLevel(parents[0]); // rough counts from tree root; OK since we only use caps per level
		remaining -= addChild(p, 1, levelCounts, users, userIndexRef);
		if (!hasSlot(p)) eligible = eligible.filter((e) => e !== p);
		else idx++;
	}
	return remaining;
}

function seedTree(root, users) {
	root.children = [];
	root.depth = 0;

	// The first user is the root, so start from index 1
	const userIndexRef = { current: 1 };
	let remaining = Math.max(0, users.length - 1);
	const wantL2 = Math.min(levelCap(2), remaining);
	const remL2 = distributeChildren([root], wantL2, 1, users, userIndexRef);
	const placedL2 = wantL2 - remL2;

	remaining -= placedL2;

	const L2nodes = root.children || [];
	const wantL3 = Math.min(levelCap(3), remaining);
	const remL3 = distributeChildren(L2nodes, wantL3, 2, users, userIndexRef);
	const placedL3 = wantL3 - remL3;

	remaining -= placedL3;

	const L3nodes = [];

	L2nodes.forEach((p) => p.children?.forEach((c) => L3nodes.push(c)));

	const wantL4 = Math.min(levelCap(4), remaining);
	const remL4 = distributeChildren(L3nodes, wantL4, 3, users, userIndexRef);
	const placedL4 = wantL4 - remL4;

	remaining -= placedL4;

	const L4nodes = [];
	L3nodes.forEach((p) => p.children?.forEach((c) => L4nodes.push(c)));

	if (remaining > 0)
		distributeChildren(L4nodes, remaining, 4, users, userIndexRef);
}

export default function Tree({ style, users = [], onUserClick }) {
	const seed = 1;
	const totalUsers = users.length;
	const [root] = useState(() => ({
		id: 1,
		name: "Root User",
		avatarUrl: "",
		children: [],
		depth: 0,
	}));
	const rng = useMemo(() => createRng(seed), [seed]);
	const svgRef = useRef(null);

	useEffect(() => {
		if (!users || users.length === 0) return;

		// Set root node to first user
		root.id = users[0].id;
		root.name = users[0].name + " " + users[0].surname;
		root.avatarUrl = users[0].image;
		root.tier = users[0].tier;
		root.quote = users[0].quote;
		root.joinDate = users[0].joinDate;
		seedTree(root, users);
		computeOrganic(root, { rng });

		// draw inside effect
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

		// Create gradients for different tiers
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
		let maxDepth = 0;
		(function detect(n) {
			maxDepth = Math.max(maxDepth, n.depth || 0);
			n.children?.forEach(detect);
		})(root);
		const baseHeight = (maxDepth + 1) * 130 + 40;

		function widthForNode(n) {
			return widthFor(n);
		}

		function adj(n) {
			const ox = n.dx || 0,
				oy = n.dy || 0;
			return {
				x: n.x + ox,
				y: baseHeight - 0 + oy - n.y,
			};
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
				const wParent = widthForNode(parent),
					wChild = widthForNode(node);
				// Draw branch
				const br = document.createElementNS(svg.namespaceURI, "path");
				br.setAttribute("d", branchPath(p.x, p.y, x, y, wParent, wChild));
				br.setAttribute("class", "tree-branch");
				gLinks.appendChild(br);
			}

			const group = document.createElementNS(svg.namespaceURI, "g");
			group.setAttribute("transform", `translate(${x},${y})`);
			// Add hover effect for avatar ring
			group.addEventListener("mouseenter", () => {
				group.classList.add("avatar-hover");
			});
			group.addEventListener("mouseleave", () => {
				group.classList.remove("avatar-hover");
			});
			gNodes.appendChild(group);

			const ring = document.createElementNS(svg.namespaceURI, "circle");
			const ringTierClass = node.tier ? `avatar-ring avatar-ring-${node.tier}` : "avatar-ring";
			
			ring.setAttribute("class", ringTierClass);
			ring.setAttribute("r", String(avatarR + 2));
			ring.setAttribute("cx", "0");
			ring.setAttribute("cy", "0");
			ring.setAttribute("pointer-events", "auto");
			group.appendChild(ring);

			const clipId = `clip-${node.id}`;
			const defs = document.createElementNS(svg.namespaceURI, "defs");
			const clip = document.createElementNS(svg.namespaceURI, "clipPath");

			clip.setAttribute("id", clipId);

			const clipCircle = document.createElementNS(svg.namespaceURI, "circle");

			clipCircle.setAttribute("r", String(avatarR));
			clipCircle.setAttribute("cx", "0");
			clipCircle.setAttribute("cy", "0");
			clip.appendChild(clipCircle);
			defs.appendChild(clip);
			group.appendChild(defs);

			const img = document.createElementNS(svg.namespaceURI, "image");

			img.setAttribute("href", node.avatarUrl);
			img.setAttribute("x", String(-avatarR));
			img.setAttribute("y", String(-avatarR));
			img.setAttribute("width", String(avatarR * 2));
			img.setAttribute("height", String(avatarR * 2));
			img.setAttribute("clip-path", `url(#${clipId})`);
			img.setAttribute("pointer-events", "auto");

			// Add click event to fire onUserClick
			if (typeof onUserClick === "function") {
				img.style.cursor = node.quote ? "pointer" : "default";
				img.addEventListener("click", (e) => {
					e.stopPropagation();
					onUserClick({
						id: node.id,
						name: node.name,
						avatar: node.avatarUrl,
						tier: node.tier,
						quote: node.quote,
						joinDate: node.joinDate,
					});
				});
			}
			group.appendChild(img);

			// Estimate card width based on text length
			const minCardWidth = 90;
			const charWidth = 6.5; // average px per character for font-size: 13px
			const nameLen = node.name ? node.name.length : 0;
			let tierText = "";
			if (node.tier && node.tier !== "standard") {
				tierText = node.tier.charAt(0).toUpperCase() + node.tier.slice(1) + " Member";
			}
			const tierLen = tierText.length;
			const maxLen = Math.max(nameLen, tierLen);
			const estWidth = Math.ceil(maxLen * charWidth) + 6; // padding
			const cardWidth = Math.max(minCardWidth, estWidth);
			const cardHeight = tierText ? 36 : 25;
			const cardX = -cardWidth / 2;
			const cardY = avatarR + 6;

			// Card background
			const cardRect = document.createElementNS(svg.namespaceURI, "rect");
			cardRect.setAttribute("x", String(cardX));
			cardRect.setAttribute("y", String(cardY));
			cardRect.setAttribute("width", String(cardWidth));
			cardRect.setAttribute("height", String(cardHeight));
			cardRect.setAttribute("rx", "6");
			cardRect.setAttribute("class", "node-label-card");
			group.appendChild(cardRect);

			// Node label text
			const label = document.createElementNS(svg.namespaceURI, "text");
			label.setAttribute("class", "node-label");
			label.setAttribute("x", "0");
			label.setAttribute("y", String(avatarR + 22));

			// User name line
			const nameTspan = document.createElementNS(svg.namespaceURI, "tspan");
			nameTspan.setAttribute("x", "0");
			nameTspan.setAttribute("dy", "0");
			nameTspan.textContent = node.name;
			label.appendChild(nameTspan);

			// Tier line
			if (tierText) {
				const tierTspan = document.createElementNS(svg.namespaceURI, "tspan");
				tierTspan.setAttribute("x", "0");
				tierTspan.setAttribute("dy", "1.2em");
				tierTspan.setAttribute("class", "node-tier-label");
				tierTspan.textContent = tierText;
				label.appendChild(tierTspan);
			}
			group.appendChild(label);

			// Leaves for all nodes
			const totalLeaves = 120;
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
					`tree-leaf tree-leaf-${node.tier || "standard"}`
				);
				leaf.setAttribute("pointer-events", "none");
				gLeaves.appendChild(leaf);
			}

			node.children?.forEach((c) => renderNode(c, node));
		}

		// trunk
		const TRUNK_HEIGHT = 220,
			TRUNK_BOTTOM_MIN = 90,
			TRUNK_TOP_MIN = 40,
			TRUNK_WIDTH_SCALE = 1.5;
		const r = root;
		const rootAdj = { x: r.x, y: baseHeight - 0 - r.y };
		const trunkStartY = rootAdj.y + TRUNK_HEIGHT;
		const wBottom = Math.max(
			TRUNK_BOTTOM_MIN,
			widthForNode(r) * TRUNK_WIDTH_SCALE
		);
		const wTop = Math.max(
			TRUNK_TOP_MIN,
			widthForNode(r) * (TRUNK_WIDTH_SCALE * 0.7)
		);
		const trunk = document.createElementNS(svg.namespaceURI, "path");

		trunk.setAttribute(
			"d",
			branchPath(rootAdj.x, trunkStartY, rootAdj.x, rootAdj.y, wBottom, wTop)
		);
		trunk.setAttribute("class", "tree-branch");
		gLinks.appendChild(trunk);

		renderNode(root);

		// Calculate tight bounding box for all content
		const minX2 = minX;
		const minY2 = minY;
		const width = maxX - minX;
		const height = maxY - minY;

		svg.setAttribute("viewBox", `${minX2} ${minY2} ${width} ${height}`);
		svg.setAttribute("width", "100%");
		svg.setAttribute("height", "100%");
		container.appendChild(svg);
	}, [root, totalUsers, seed, onUserClick]);

	return (
		<div
			className="tree-container-wrapper"
			style={style}
		>
			<div
				id="tree-container"
				ref={svgRef}
			/>
		</div>
	);
}

Tree.propTypes = {
	style: PropTypes.object,
	users: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			avatar: PropTypes.string.isRequired,
			tier: PropTypes.oneOf([
				"platinum",
				"gold",
				"silver",
				"bronze",
				"standard",
			]).isRequired,
			quote: PropTypes.string, // optional, since not all objects have it
			joinDate: PropTypes.string.isRequired, // ISO date string
		})
	),
	onUserClick: PropTypes.func,
};

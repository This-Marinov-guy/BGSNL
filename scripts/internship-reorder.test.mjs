import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";

const require = createRequire(import.meta.url);
const filename = "src/elements/actions/dashboard/internships/InternshipList.jsx";
await loadBindings();
const { code } = await transform(await readFile(new URL(`../${filename}`, import.meta.url), "utf8"), {
  filename,
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});

function harness() {
  const internships = ["Alpha", "Beta", "Gamma"].map((company, index) => ({
    _id: String(index + 1), company, specialty: "Role", label: "Bulgarian", isActive: true,
  }));
  const slots = [];
  let cursor = 0;
  let pointerTarget = null;
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = index === 0 ? internships : index === 1 ? true : initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback: callback => callback,
    useEffect: () => {},
  };
  const exports = {};
  vm.runInNewContext(code, { exports, document: {
    elementFromPoint: () => pointerTarget && { closest: () => ({ dataset: { internshipId: pointerTarget } }) },
  }, require: name => {
    if (name === "react") return hooks;
    if (name === "react-redux") return { useDispatch: () => () => {} };
    if (name === "react/jsx-runtime") return require(name);
    if (name === "next/navigation") return { useSearchParams: () => ({ get: () => null }) };
    if (name.endsWith("http-hook")) return { useHttpClient: () => ({ sendRequest: async () => null, loading: false }) };
    if (name.endsWith("notification")) return { showNotification: () => ({}) };
    if (name.endsWith("IconlyIcons")) return { FiEdit2: "edit-icon", FiTrash2: "delete-icon" };
    if (name.endsWith("LoadState")) return { LoadingSkeleton: "skeleton", LoadErrorBanner: "error" };
    if (name.endsWith("InternshipForm")) return { __esModule: true, default: "internship-form" };
    if (name.endsWith("ConfirmCenterModal")) return { __esModule: true, default: "confirm-modal" };
    if (name.endsWith("internship-list.module.scss")) return { __esModule: true, default: {} };
    throw new Error(`Unexpected import: ${name}`);
  } });
  const elements = node => !node ? [] : Array.isArray(node) ? node.flatMap(elements)
    : typeof node === "object" ? [node, ...elements(node.props?.children)] : [];
  const render = () => { cursor = 0; return elements(exports.default()); };
  const order = () => render().filter(node => node.type === "article").map(node => node.props["data-internship-id"]);
  const grip = id => render().find(node => node.type === "button" && node.props["aria-label"]?.startsWith(`Reorder ${internships[Number(id) - 1].company}`));
  return { render, order, grip, setPointerTarget: id => { pointerTarget = id; } };
}

test("the icon handle reorders with arrow keys and has no separate move buttons", () => {
  const h = harness();
  const buttons = h.render().filter(node => node.type === "button");
  assert.equal(buttons.some(node => /^Move .* (up|down)$/.test(node.props["aria-label"] || "")), false);
  assert.equal(h.grip("2").props.children.type().type, "svg");
  let prevented = false;
  h.grip("2").props.onKeyDown({ key: "ArrowUp", preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(h.order(), ["2", "1", "3"]);
});

test("dragging the handle over another row reorders the list", () => {
  const h = harness();
  const grip = h.grip("1");
  let captured = false;
  grip.props.onPointerDown({ pointerId: 7, pointerType: "touch", currentTarget: { setPointerCapture: () => { captured = true; } } });
  assert.equal(captured, true);
  h.setPointerTarget("3");
  grip.props.onPointerMove({ pointerId: 7, clientX: 20, clientY: 100 });
  grip.props.onPointerUp({ pointerId: 7, clientX: 20, clientY: 100 });
  assert.deepEqual(h.order(), ["2", "3", "1"]);
});

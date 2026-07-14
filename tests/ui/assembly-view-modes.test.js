import test from "node:test";
import assert from "node:assert/strict";
import { ASSEMBLY_VIEW_MODES, getViewModeOverlay, layoutOverlayLabels, renderViewModeOverlay } from "../../src/ui/ship-assembly/assembly-view-modes.js";

test("structure labels derive depth through parent nodes when no parent port remains", () => {
  const assembly = {
    nodesById: {
      root: { nodeId: "root", parentNodeId: null },
      branch: { nodeId: "branch", parentNodeId: "root" },
      relocated: { nodeId: "relocated", parentNodeId: "branch", parentPortId: null }
    },
    portsById: {}
  };
  const geometry = {
    connections: [],
    nodes: [
      { nodeId: "root", isRoot: true, worldPosition: { x: 0, y: 0 } },
      { nodeId: "relocated", isRoot: false, parentNodeId: "branch", parentPortId: null, worldPosition: { x: 1, y: 1 } }
    ]
  };

  const overlay = getViewModeOverlay(ASSEMBLY_VIEW_MODES.STRUCTURE, { assembly, geometry });

  assert.equal(overlay.labels[1].text, "T1");
});

test("diagnostic labels receive deterministic non-overlapping positions", () => {
  const labels = layoutOverlayLabels([
    { text: "A", position: { x: 0, y: 0 } },
    { text: "B", position: { x: 2, y: 2 } }
  ], { minimumDistance: 12 });

  assert.deepEqual(labels[0].position, { x: 0, y: 0 });
  assert.ok(Math.sqrt(labels[1].position.x * labels[1].position.x + labels[1].position.y * labels[1].position.y) >= 12);
  assert.deepEqual(layoutOverlayLabels(labels, { minimumDistance: 12 }), labels);
});

test("non-positive minimumDistance never shifts labels", () => {
  const input = [
    { text: "A", position: { x: 0, y: 0 } },
    { text: "B", position: { x: 1, y: 1 } }
  ];

  // A negative minimumDistance must not be squared into a positive threshold:
  // overlapping labels stay put, matching the original Math.hypot behaviour.
  assert.deepEqual(layoutOverlayLabels(input, { minimumDistance: -12 }), input);
  assert.deepEqual(layoutOverlayLabels(input, { minimumDistance: 0 }), input);
});

test("connection overlays draw paths and labels", () => {
  const calls = [];
  const context = new Proxy({}, {
    get: (_target, property) => ["save", "restore", "beginPath", "stroke"].includes(property)
      ? () => calls.push([property])
      : property === "moveTo" || property === "lineTo" || property === "fillText"
        ? (...args) => calls.push([property, ...args])
        : undefined,
    set: () => true
  });

  renderViewModeOverlay(context, {
    connections: [{ cable: { from: { x: 1, y: 2 }, to: { x: 3, y: 4 } }, label: "standard" }],
    labels: [{ position: { x: 5, y: 6 }, text: "T1" }]
  });

  assert.ok(calls.some(([name, x, y]) => name === "moveTo" && x === 1 && y === 2));
  assert.ok(calls.some(([name, text]) => name === "fillText" && text === "standard"));
  assert.ok(calls.some(([name, text]) => name === "fillText" && text === "T1"));
});

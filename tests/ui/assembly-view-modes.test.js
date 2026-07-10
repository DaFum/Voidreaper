import test from "node:test";
import assert from "node:assert/strict";
import { renderViewModeOverlay } from "../../src/ui/ship-assembly/assembly-view-modes.js";

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

import test from "node:test";
import assert from "node:assert/strict";
import { createInputController } from "../../src/input/input-controller.js";
import { DEFAULT_BINDINGS } from "../../src/input/action-bindings.js";

const mockElement = () => ({ addEventListener: () => {}, removeEventListener: () => {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) });

test("createInputController initializes with bindings and touch stick", () => {
  const eventBus = { emit: test.mock.fn() };
  const controller = createInputController({ eventBus, stickElement: mockElement(), stickKnob: { style: {} } });

  assert.deepEqual(controller.bindings, DEFAULT_BINDINGS, "Initializes with default bindings");
  assert.equal(typeof controller.start, "function");
  assert.equal(typeof controller.stop, "function");
});

test("createInputController correctly handles axis input", () => {
  const controller = createInputController({ stickElement: mockElement(), stickKnob: { style: {} } });

  assert.deepEqual(controller.axis(), { x: 0, y: 0 }, "Default axis is 0,0");
});

test("createInputController rebinds actions and triggers custom ones", () => {
  const eventBus = { emit: test.mock.fn() };
  const controller = createInputController({ eventBus, stickElement: mockElement(), stickKnob: { style: {} } });

  controller.rebind("move-up", "KeyW");
  assert.equal(controller.bindings["KeyW"], "move-up", "Action rebounded successfully");

  controller.trigger("fire", "keyboard");
  assert.equal(eventBus.emit.mock.calls.length, 1);
  assert.deepEqual(eventBus.emit.mock.calls[0].arguments, ["action", { action: "fire", source: "keyboard" }]);
});
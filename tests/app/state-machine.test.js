import test from "node:test";
import assert from "node:assert/strict";
import { createStateMachine } from "../../src/app/state-machine.js";

test("createStateMachine initializes with valid state and validates transitions", () => {
  const eventBus = { emit: test.mock.fn() };
  const machine = createStateMachine("menu", eventBus);

  assert.equal(machine.state, "menu", "Initial state is menu");
  assert.equal(machine.can("hangar"), true, "Can transition from menu to hangar");
  assert.equal(machine.can("gameover"), false, "Cannot transition from menu to gameover directly");

  assert.throws(() => createStateMachine("invalid_state"), { message: "Unknown initial state: invalid_state" });
});

test("createStateMachine handles transitions and emits events", () => {
  const eventBus = { emit: test.mock.fn() };
  const machine = createStateMachine("menu", eventBus);

  const newState = machine.transition("hangar", { some: "data" });
  assert.equal(newState, "hangar");
  assert.equal(machine.state, "hangar");

  assert.equal(eventBus.emit.mock.calls.length, 1);
  assert.deepEqual(eventBus.emit.mock.calls[0].arguments, ["state-changed", { previousState: "menu", state: "hangar", detail: { some: "data" } }]);

  assert.throws(() => machine.transition("invalid_target"), { message: "Invalid state transition: hangar -> invalid_target" });
});

test("createStateMachine handles returnToPrevious", () => {
  const eventBus = { emit: test.mock.fn() };
  const machine = createStateMachine("menu", eventBus);

  machine.transition("hangar");
  assert.equal(machine.state, "hangar");

  const returnedState = machine.returnToPrevious();
  assert.equal(returnedState, "menu");
  assert.equal(machine.state, "menu");

  const returnedState2 = machine.returnToPrevious();
  assert.equal(returnedState2, "menu");
});
import test from "node:test";
import assert from "node:assert/strict";
import { createEventBus } from "../../src/core/event-bus.js";

test("createEventBus supports pub/sub and unsubscribe", () => {
  const bus = createEventBus();

  const handler = test.mock.fn();
  const unsubscribe = bus.on("test-event", handler);

  bus.emit("test-event", { data: 1 });
  assert.equal(handler.mock.calls.length, 1);
  assert.deepEqual(handler.mock.calls[0].arguments, [{ data: 1 }]);

  bus.emit("other-event", { data: 2 });
  assert.equal(handler.mock.calls.length, 1, "Should not be called for other events");

  unsubscribe();
  bus.emit("test-event", { data: 3 });
  assert.equal(handler.mock.calls.length, 1, "Should not be called after unsubscribe");
});

test("createEventBus clear removes all listeners", () => {
  const bus = createEventBus();

  const handler = test.mock.fn();
  bus.on("test-event", handler);

  bus.clear();

  bus.emit("test-event", { data: 1 });
  assert.equal(handler.mock.calls.length, 0, "Should not be called after clear");
});
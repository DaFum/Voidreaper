import test from "node:test";
import assert from "node:assert/strict";
import { createTouchStick } from "../../src/input/touch-stick.js";

test("touch movement reports the same semantic magnitude as keyboard movement", () => {
  const listeners = new Map();
  const element = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    setPointerCapture() {}
  };
  const movements = [];
  createTouchStick(element, null, 56, movement => movements.push(movement));
  listeners.get("pointerdown")({ pointerId: 1, clientX: 10, clientY: 10 });
  listeners.get("pointermove")({ pointerId: 1, clientX: 38, clientY: 10 });
  assert.equal(movements.at(-1).source, "touch");
  assert.equal(movements.at(-1).magnitude, .5);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createCameraState } from "../../src/render/camera.js";

test("createCameraState creates default state", () => {
  const camera = createCameraState();

  assert.equal(camera.x, 0);
  assert.equal(camera.y, 0);
  assert.equal(camera.shake, 0);
  assert.equal(camera.shakeX, 0);
  assert.equal(camera.shakeY, 0);
  assert.equal(camera.zoom, 1);
});
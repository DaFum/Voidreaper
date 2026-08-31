import test from "node:test";
import assert from "node:assert/strict";
import { createBuildAnimationController } from "../../../src/features/ship-assembly/mounting/build-animation-controller.js";

test("build animation controller - normal motion phase progression", () => {
  const ctrl = createBuildAnimationController({ reducedMotion: false });
  ctrl.start("node-1", { mode: "mount", workbench: false }); // duration = 0.8s

  let snap = ctrl.snapshot();
  assert.equal(snap.length, 1);
  assert.equal(snap[0].nodeId, "node-1");
  assert.equal(snap[0].phase, "port-glow");

  ctrl.update(0.4); // 50% through
  snap = ctrl.snapshot();
  assert.equal(snap.length, 1);

  ctrl.update(0.4); // complete
  snap = ctrl.snapshot();
  assert.equal(snap.length, 0);
});

test("build animation controller - reduced motion phase sequence", () => {
  const ctrl = createBuildAnimationController({ reducedMotion: true });
  ctrl.start("node-2", { mode: "mount", workbench: false }); // duration = 0.3s

  let snap = ctrl.snapshot();
  assert.equal(snap.length, 1);
  assert.equal(snap[0].nodeId, "node-2");
  assert.equal(snap[0].phase, "port-glow");

  ctrl.update(0.12); // ~40% through -> lock-core
  snap = ctrl.snapshot();
  assert.equal(snap.length, 1);
  assert.equal(snap[0].phase, "lock-core");

  ctrl.update(0.12); // ~80% through -> power-up
  snap = ctrl.snapshot();
  assert.equal(snap.length, 1);
  assert.equal(snap[0].phase, "power-up");

  ctrl.update(0.1); // complete
  snap = ctrl.snapshot();
  assert.equal(snap.length, 0);
});

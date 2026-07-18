import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeId, createIdService } from "../../src/core/ids.js";

test("createRuntimeId generates expected format and increments", () => {
  const id1 = createRuntimeId("test");
  const id2 = createRuntimeId("test");

  assert.equal(id1.startsWith("test-"), true, "Prefixes correctly");
  assert.equal(id1 !== id2, true, "Generates unique IDs");

  const defaultId = createRuntimeId();
  assert.equal(defaultId.startsWith("runtime-"), true, "Uses default prefix");
});

test("createIdService generates scoped IDs and can be restored", () => {
  const service = createIdService("run1");

  const id1 = service.create("mob");
  assert.equal(id1, "run1-mob-1");

  const id2 = service.create("mob");
  assert.equal(id2, "run1-mob-2");

  assert.equal(service.snapshot(), 2, "Snapshot matches counter");
  assert.equal(service.prefix, "run1", "Returns prefix");

  const service2 = createIdService("run2", service.snapshot());
  const id3 = service2.create("mob");
  assert.equal(id3, "run2-mob-3", "Restores and increments correctly");

  service2.restore(10);
  const id4 = service2.create("mob");
  assert.equal(id4, "run2-mob-b", "Restored to 10 (a in base36) and increments to 11 (b in base36)");
});
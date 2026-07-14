import test from "node:test";
import assert from "node:assert/strict";
import { createRegistry } from "../../src/core/registry.js";

test("registry clones cyclic content without recursing forever", () => {
  const definition = { id: "cyclic" };
  definition.self = definition;

  const registered = createRegistry("test").register(definition);

  assert.equal(registered.self, registered);
  assert.equal(Object.isFrozen(registered), true);
});

test("registry preserves Map, Set, and Date content types", () => {
  const registered = createRegistry("test").register({
    id: "rich",
    map: new Map([["key", { value: 1 }]]),
    set: new Set([{ value: 2 }]),
    date: new Date("2026-07-14T00:00:00.000Z")
  });

  assert.equal(registered.map instanceof Map, true);
  assert.equal(registered.map.get("key").value, 1);
  assert.equal(registered.set instanceof Set, true);
  assert.equal([...registered.set][0].value, 2);
  assert.equal(registered.date instanceof Date, true);
  assert.equal(registered.date.toISOString(), "2026-07-14T00:00:00.000Z");
});

test("registry prevents mutation through preserved built-in collection APIs", () => {
  const registered = createRegistry("test").register({
    id: "immutable-rich",
    map: new Map([["key", 1]]),
    set: new Set([1]),
    date: new Date("2026-07-14T00:00:00.000Z")
  });

  assert.throws(() => registered.map.set("other", 2), /read-only/);
  assert.throws(() => registered.set.add(2), /read-only/);
  assert.throws(() => registered.date.setTime(0), /read-only/);
  registered.map.forEach((_value, _key, collection) => {
    assert.throws(() => collection.set("other", 2), /read-only/);
  });
  registered.set.forEach((_value, _again, collection) => {
    assert.throws(() => collection.add(2), /read-only/);
  });
  assert.deepEqual([...registered.map], [["key", 1]]);
  assert.deepEqual([...registered.set], [1]);
  assert.equal(registered.date.toISOString(), "2026-07-14T00:00:00.000Z");
});

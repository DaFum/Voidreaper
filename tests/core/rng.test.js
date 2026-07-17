import test from "node:test";
import assert from "node:assert/strict";
import { createRunRng } from "../../src/core/rng.js";

test("createRunRng initializes and generates deterministic numbers", () => {
  const rng = createRunRng(12345);

  assert.equal(rng.seed, 12345);

  const val1 = rng.next();
  const val2 = rng.next();

  assert.ok(val1 >= 0 && val1 < 1, "next() returns float between 0 and 1");
  assert.ok(val2 >= 0 && val2 < 1, "next() returns float between 0 and 1");
  assert.notEqual(val1, val2, "Generates different numbers sequentially");

  const rngSame = createRunRng(12345);
  assert.equal(rngSame.next(), val1, "Deterministic based on seed");
});

test("createRunRng provides utility methods", () => {
  const rng = createRunRng(12345);

  const rangeVal = rng.range(5, 10);
  assert.ok(rangeVal >= 5 && rangeVal < 10, "range() returns value between min and max");

  const intVal = rng.integer(5, 10);
  assert.ok(Number.isInteger(intVal), "integer() returns an integer");
  assert.ok(intVal >= 5 && intVal <= 10, "integer() returns value between min and maxInclusive");

  const arr = ["a", "b", "c"];
  const picked = rng.pick(arr);
  assert.ok(arr.includes(picked), "pick() returns an element from array");
});

test("createRunRng weighted picking", () => {
  const rng = createRunRng(12345);

  const entries = [
    { value: "rare", weight: 1 },
    { value: "common", weight: 99 }
  ];

  const results = { rare: 0, common: 0 };
  for (let i = 0; i < 1000; i++) {
    results[rng.weighted(entries)]++;
  }

  assert.ok(results.common > 900, "Weighted picking honors weights");

  assert.equal(rng.weighted([]), null, "Returns null for empty array");
  assert.equal(rng.weighted([{ value: "a", weight: -1 }]), "a", "Handles negative weights by treating them as 0");
});

test("createRunRng supports snapshot and restore", () => {
  const rng1 = createRunRng(12345);

  rng1.next(); // advance state
  const snapshot = rng1.snapshot();

  const val1 = rng1.next();

  const rng2 = createRunRng(12345, snapshot);
  const val2 = rng2.next();

  assert.equal(val2, val1, "Restored state generates same subsequent sequence");
});
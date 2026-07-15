import test from "node:test";
import assert from "node:assert/strict";
import { assertWreckSignal } from "../../../src/features/salvage/wreck-signal-schema.js";

test("assertWreckSignal", async (t) => {
  const validSignal = {
    id: "wreck-1",
    itemSnapshot: {},
    regionId: "region-a",
    corruption: 50,
    deathCause: "destroyed",
    createdAtRun: 10,
    expiresAfterRun: 15
  };

  await t.test("returns the signal unmodified if all required fields are present", () => {
    const result = assertWreckSignal(validSignal);
    assert.equal(result, validSignal);
  });

  const requiredFields = [
    "id",
    "itemSnapshot",
    "regionId",
    "corruption",
    "deathCause",
    "createdAtRun",
    "expiresAfterRun"
  ];

  for (const field of requiredFields) {
    await t.test(`throws an error if ${field} is undefined`, () => {
      const invalidSignal = { ...validSignal };
      delete invalidSignal[field];

      assert.throws(
        () => assertWreckSignal(invalidSignal),
        new Error(`Invalid wreck signal: ${field}`)
      );
    });

    await t.test(`throws an error if ${field} is null`, () => {
      const invalidSignal = { ...validSignal };
      invalidSignal[field] = null;

      assert.throws(
        () => assertWreckSignal(invalidSignal),
        new Error(`Invalid wreck signal: ${field}`)
      );
    });
  }
});

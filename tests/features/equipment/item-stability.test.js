import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describeStability } from "../../../src/features/equipment/item-stability.js";

describe("describeStability", () => {
  it("returns 'corrupted' if corruptionLevel is 75 or higher", () => {
    assert.equal(describeStability({ corruptionLevel: 75 }), "corrupted");
    assert.equal(describeStability({ corruptionLevel: 100 }), "corrupted");
    assert.equal(describeStability({ corruption: 75 }), "corrupted");
  });

  it("prioritizes corruption over a legacy string stability", () => {
    assert.equal(describeStability({ corruptionLevel: 75, stability: "stable" }), "corrupted");
    assert.equal(describeStability({ corruptionLevel: 75, stability: "damaged" }), "corrupted");
  });

  it("returns legacy string stability if corruption is below 75", () => {
    assert.equal(describeStability({ corruptionLevel: 0, stability: "stable" }), "stable");
    assert.equal(describeStability({ corruptionLevel: 50, stability: "damaged" }), "damaged");
  });

  it("returns 'damaged' if numeric stability is below 75", () => {
    assert.equal(describeStability({ stability: 74 }), "damaged");
    assert.equal(describeStability({ stability: 0 }), "damaged");
  });

  it("returns 'stable' if numeric stability is 75 or higher", () => {
    assert.equal(describeStability({ stability: 75 }), "stable");
    assert.equal(describeStability({ stability: 100 }), "stable");
  });

  it("defaults to 'stable' if stability is undefined", () => {
    assert.equal(describeStability({}), "stable");
  });

  it("defaults to 'stable' if item is undefined", () => {
    assert.equal(describeStability(undefined), "stable");
  });
});

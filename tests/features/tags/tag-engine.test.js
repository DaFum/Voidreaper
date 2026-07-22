import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createTagEngine } from "../../../src/features/tags/tag-engine.js";

describe("createTagEngine", () => {
  const mockDefinitions = [
    { id: "tag-a" },
    { id: "tag-b" },
    { id: "tag-c" }
  ];

  const mockSynergies = [
    {
      id: "syn-1",
      requirements: [{ id: "tag-a", minimum: 2 }]
    },
    {
      id: "syn-2",
      requirements: [{ id: "tag-b", minimum: 1 }],
      blockedBy: ["tag-c"]
    },
    {
      id: "syn-3",
      requirements: [{ id: "tag-c", minimum: 1 }],
      minimumCorruption: 50
    }
  ];

  it("warns about unknown tags during collection", () => {
    const consoleWarn = mock.method(console, "warn", () => {});
    const engine = createTagEngine(mockDefinitions, []);

    const sources = [
      { id: "src-1", tags: [{ id: "tag-a", value: 1 }, { id: "tag-unknown", value: 1 }] }
    ];

    engine.collect(sources);

    assert.equal(consoleWarn.mock.calls.length, 1);
    assert.equal(consoleWarn.mock.calls[0].arguments[0], "Unknown tag: tag-unknown");
    consoleWarn.mock.restore();
  });

  it("collects and totals tags accurately with provenance", () => {
    const engine = createTagEngine(mockDefinitions, []);
    const sources = [
      { id: "src-1", tags: [{ id: "tag-a", value: 2 }] },
      { id: "src-2", tags: [{ id: "tag-a", value: 1 }, { id: "tag-b" }] } // missing value defaults to 1
    ];

    const tags = engine.collect(sources);

    assert.equal(tags.totals.get("tag-a"), 3);
    assert.equal(tags.totals.get("tag-b"), 1);

    assert.deepEqual(tags.provenance.get("tag-a"), [
      { sourceId: "src-1", value: 2 },
      { sourceId: "src-2", value: 1 }
    ]);
  });

  it("resolves active, near, and blocked synergies correctly", () => {
    const engine = createTagEngine(mockDefinitions, mockSynergies);

    // Case 1: active (syn-2 is active, syn-1 is near, syn-3 is blocked due to missing context constraint)
    let tags = engine.collect([
      { id: "src-1", tags: [{ id: "tag-a", value: 1 }, { id: "tag-b", value: 1 }] }
    ]);
    let resolved = engine.resolve(tags, { corruption: 0 });

    assert.deepEqual(resolved.active.map(s => s.id), ["syn-2"]);
    assert.deepEqual(resolved.near.map(s => s.id), ["syn-1"]);
    // syn-3 is in blocked because corruption is 0 but it needs 50
    assert.ok(resolved.blocked.map(s => s.id).includes("syn-3"));

    // Case 2: blocked by tag (syn-2 blocked by tag-c)
    tags = engine.collect([
      { id: "src-1", tags: [{ id: "tag-b", value: 1 }, { id: "tag-c", value: 1 }] }
    ]);
    resolved = engine.resolve(tags, { corruption: 0 });

    assert.deepEqual(resolved.active, []);
    assert.ok(resolved.blocked.map(s => s.id).includes("syn-2"));

    // Case 3: blocked by context (syn-3 blocked by low corruption)
    assert.ok(resolved.blocked.map(s => s.id).includes("syn-3"));

    // Case 4: unblocked by context (syn-3 active with high corruption)
    resolved = engine.resolve(tags, { corruption: 60 });
    assert.ok(resolved.active.map(s => s.id).includes("syn-3"));

    // Validate the complete structure of the blocked synergy to ensure it has forbiddenBy logic correctly applied
    const blockedSyn2 = resolved.blocked.find(s => s.id === "syn-2");
    if (blockedSyn2) {
      assert.deepEqual(blockedSyn2.forbiddenBy, ["tag-c"]);
    }
  });

  it("calculates deltas correctly between two source sets", () => {
    const engine = createTagEngine(mockDefinitions, []);

    const beforeSources = [
      { id: "src-1", tags: [{ id: "tag-a", value: 2 }, { id: "tag-b", value: 1 }] }
    ];

    const afterSources = [
      { id: "src-1", tags: [{ id: "tag-a", value: 3 }] }, // tag-a increased, tag-b removed
      { id: "src-2", tags: [{ id: "tag-c", value: 1 }] }  // tag-c added
    ];

    const deltas = engine.delta(beforeSources, afterSources);

    // Expected deltas
    // tag-a: before 2, after 3
    // tag-b: before 1, after 0
    // tag-c: before 0, after 1

    assert.equal(deltas.length, 3);

    const tagA = deltas.find(d => d.id === "tag-a");
    assert.deepEqual(tagA, { id: "tag-a", before: 2, after: 3 });

    const tagB = deltas.find(d => d.id === "tag-b");
    assert.deepEqual(tagB, { id: "tag-b", before: 1, after: 0 });

    const tagC = deltas.find(d => d.id === "tag-c");
    assert.deepEqual(tagC, { id: "tag-c", before: 0, after: 1 });
  });

  it("delta ignores unchanged tags", () => {
    const engine = createTagEngine(mockDefinitions, []);
    const beforeSources = [{ id: "src-1", tags: [{ id: "tag-a", value: 1 }] }];
    const afterSources = [{ id: "src-2", tags: [{ id: "tag-a", value: 1 }] }];

    const deltas = engine.delta(beforeSources, afterSources);
    assert.equal(deltas.length, 0);
  });
});

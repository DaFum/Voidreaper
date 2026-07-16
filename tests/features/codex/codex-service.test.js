import test from "node:test";
import assert from "node:assert/strict";
import { createCodexService } from "../../../src/features/codex/codex-service.js";
import { CODEX_STRINGS } from "../../../src/features/codex/codex-strings.js";

test("codex service handles empty registries", () => {
  const service = createCodexService();
  assert.deepEqual(service.entries, []);
});

test("codex service maps definition registries to entries", () => {
  const registries = {
    ships: [
      { id: "ship-a", name: "Ship A", description: "A ship", unlockSource: "found", tags: ["small"] },
      { id: "ship-b", name: "Ship B", reward: "B reward", tags: [{id: "large"}] },
      { id: "ship-c", name: "Ship C" }
    ],
    forbidden: [
      { id: "secret-1", name: "Secret 1" }
    ],
    weapons: [
      { id: "wep-1", name: "Wep 1", forbidden: true }
    ]
  };

  const service = createCodexService(registries);

  assert.equal(service.entries.length, 5);

  const shipA = service.entries.find(e => e.id === "ships:ship-a");
  assert.deepEqual(shipA, {
    id: "ships:ship-a",
    contentId: "ship-a",
    category: "ships",
    name: "Ship A",
    description: "A ship",
    tags: ["small"],
    source: "found",
    forbidden: undefined
  });

  const shipB = service.entries.find(e => e.id === "ships:ship-b");
  assert.equal(shipB.description, "B reward");
  assert.deepEqual(shipB.tags, ["large"]);
  assert.equal(shipB.source, "ships");

  const shipC = service.entries.find(e => e.id === "ships:ship-c");
  assert.equal(shipC.description, CODEX_STRINGS.FALLBACK_DESCRIPTION);
  assert.deepEqual(shipC.tags, []);

  const secret1 = service.entries.find(e => e.id === "forbidden:secret-1");
  assert.equal(secret1.forbidden, true);

  const wep1 = service.entries.find(e => e.id === "weapons:wep-1");
  assert.equal(wep1.forbidden, true);
});

test("codex service discovers entries and updates levels", () => {
  const service = createCodexService();
  const save = { codex: {} };

  // Discover with evidence = 1
  let result = service.discover(save, "ships:ship-a");
  assert.equal(result.evidence, 1);
  assert.equal(result.level, "observed");
  assert.deepEqual(save.codex["ships:ship-a"], { evidence: 1, level: "observed" });

  // Discover with evidence = 2 (total 3)
  result = service.discover(save, "ships:ship-a", 2);
  assert.equal(result.evidence, 3);
  assert.equal(result.level, "analyzed");

  // Discover with evidence = 4 (total 7)
  result = service.discover(save, "ships:ship-a", 4);
  assert.equal(result.evidence, 7);
  assert.equal(result.level, "mastered");

  // Discover with even more evidence to test upper bound capping
  result = service.discover(save, "ships:ship-a", 10);
  assert.equal(result.evidence, 17);
  assert.equal(result.level, "mastered");
});

test("codex service views entries based on state", () => {
  const service = createCodexService();

  const normalEntry = {
    id: "ships:ship-a",
    name: "Ship A",
    description: "A normal ship",
    forbidden: false
  };

  const forbiddenEntry = {
    id: "forbidden:secret-1",
    name: "Secret 1",
    description: "A secret thing",
    forbidden: true
  };

  // Normal entry, unknown state
  assert.deepEqual(service.view(normalEntry, null), {
    ...normalEntry,
    level: "unknown",
    description: CODEX_STRINGS.UNKNOWN_SIGNATURE
  });

  // Normal entry, known state
  assert.deepEqual(service.view(normalEntry, { level: "observed" }), {
    ...normalEntry,
    level: "observed",
    description: "A normal ship"
  });

  // Forbidden entry, unknown state
  assert.deepEqual(service.view(forbiddenEntry, null), {
    ...forbiddenEntry,
    level: "unknown",
    name: CODEX_STRINGS.FORBIDDEN_NAME,
    description: CODEX_STRINGS.FORBIDDEN_DESCRIPTION
  });

  // Forbidden entry, known state
  assert.deepEqual(service.view(forbiddenEntry, { level: "analyzed" }), {
    ...forbiddenEntry,
    level: "analyzed",
    description: "A secret thing"
  });
});

test("codex service filters entries correctly", () => {
  const registries = {
    ships: [
      { id: "ship-a", name: "Ship A", tags: ["fast"], unlockSource: "found" },
      { id: "ship-b", name: "Ship B", tags: ["slow"], unlockSource: "bought" }
    ],
    weapons: [
      { id: "wep-1", name: "Wep 1", tags: ["fast"] }
    ]
  };

  const service = createCodexService(registries);

  const save = {
    codex: {
      "ships:ship-a": { level: "observed" },
      "ships:ship-b": { level: "unknown" },
      "weapons:wep-1": { level: "observed" }
    }
  };

  // No filters
  const all = service.filter(save);
  assert.equal(all.length, 3);

  // Filter by category
  const ships = service.filter(save, { category: "ships" });
  assert.equal(ships.length, 2);
  assert.equal(ships[0].id, "ships:ship-a");

  // Filter by status (level)
  const observed = service.filter(save, { status: "observed" });
  assert.equal(observed.length, 2);
  assert.equal(observed[0].id, "ships:ship-a");
  assert.equal(observed[1].id, "weapons:wep-1");

  // Filter by source
  const found = service.filter(save, { source: "found" });
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "ships:ship-a");

  // Filter by tag
  const fast = service.filter(save, { tag: "fast" });
  assert.equal(fast.length, 2);
  assert.equal(fast[0].id, "ships:ship-a");
  assert.equal(fast[1].id, "weapons:wep-1");

  // Filter by multiple criteria
  const fastObservedShips = service.filter(save, { category: "ships", status: "observed", tag: "fast" });
  assert.equal(fastObservedShips.length, 1);
  assert.equal(fastObservedShips[0].id, "ships:ship-a");
});

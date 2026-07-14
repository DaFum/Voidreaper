import test from "node:test";
import assert from "node:assert/strict";
import { migrateSave } from "../../../src/persistence/migrations.js";

test("migrateSave preserves array-based inputs for inventory, wreckSignals, codex, challenges", () => {
  const input = {
    saveVersion: 3,
    inventory: [{ id: 'railgun', instanceId: 'item-1', qty: 2 }],
    wreckSignals: [{ id: 'wreck-1' }],
    codex: [{ id: 'codex-1' }],
    challenges: [{ id: 'chal-1' }]
  };
  const output = migrateSave(input);

  assert.deepEqual(output.inventory, { 'item-1': { id: 'railgun', instanceId: 'item-1', qty: 2 } });
  assert.deepEqual(output.wreckSignals, { 'wreck-1': { id: 'wreck-1' } });
  assert.deepEqual(output.codex, { 'codex-1': { id: 'codex-1' } });
  assert.deepEqual(output.challenges, { 'chal-1': { id: 'chal-1' } });
});

test("migrateSave preserves array-based inputs for inventory, wreckSignals, codex, challenges on newer saves (v6+)", () => {
  const input = {
    saveVersion: 6,
    inventory: [{ id: 'railgun', instanceId: 'item-1', qty: 2 }],
    wreckSignals: [{ id: 'wreck-1' }],
    codex: [{ id: 'codex-1' }],
    challenges: [{ id: 'chal-1' }]
  };
  const output = migrateSave(input);

  assert.deepEqual(output.inventory, { 'item-1': { id: 'railgun', instanceId: 'item-1', qty: 2 } });
  assert.deepEqual(output.wreckSignals, { 'wreck-1': { id: 'wreck-1' } });
  assert.deepEqual(output.codex, { 'codex-1': { id: 'codex-1' } });
  assert.deepEqual(output.challenges, { 'chal-1': { id: 'chal-1' } });
});

test("migrateSave preserves array-based inputs for inventory, wreckSignals, codex, challenges on current saves (v5)", () => {
  const input = {
    saveVersion: 5,
    inventory: [{ id: 'railgun', instanceId: 'item-1', qty: 2 }],
    wreckSignals: [{ id: 'wreck-1' }],
    codex: [{ id: 'codex-1' }],
    challenges: [{ id: 'chal-1' }]
  };
  const output = migrateSave(input);

  assert.deepEqual(output.inventory, { 'item-1': { id: 'railgun', instanceId: 'item-1', qty: 2 } });
  assert.deepEqual(output.wreckSignals, { 'wreck-1': { id: 'wreck-1' } });
  assert.deepEqual(output.codex, { 'codex-1': { id: 'codex-1' } });
  assert.deepEqual(output.challenges, { 'chal-1': { id: 'chal-1' } });
});

test("migrateSave keeps existing object-based inputs unmodified", () => {
  const input = {
    saveVersion: 5,
    inventory: { 'item-2': { id: 'item-2', qty: 5 } },
    wreckSignals: { 'wreck-2': { id: 'wreck-2' } },
    codex: { 'codex-2': { id: 'codex-2' } },
    challenges: { 'chal-2': { id: 'chal-2' } }
  };
  const output = migrateSave(input);

  assert.deepEqual(output.inventory, { 'item-2': { id: 'item-2', qty: 5 } });
  assert.deepEqual(output.wreckSignals, { 'wreck-2': { id: 'wreck-2' } });
  assert.deepEqual(output.codex, { 'codex-2': { id: 'codex-2' } });
  assert.deepEqual(output.challenges, { 'chal-2': { id: 'chal-2' } });
});

test("migrateSave converts version-5 onboarding without changing unlocks", () => {
  const unlocks = { vesper: true, railgun: true, "standard-core": true, bastion: false };
  const output = migrateSave({ saveVersion: 5, unlocks, onboarding: { skipped: false, completed: { 1: true, 3: true } } });
  assert.equal(output.saveVersion, 6);
  assert.deepEqual(output.unlocks, unlocks);
  assert.equal(output.tutorial.autoOffer, false);
  assert.deepEqual(output.tutorial.seenSteps, { "legacy-run-1": true, "legacy-run-3": true });
  assert.equal("onboarding" in output, false);
});

test("migrateSave keeps new tutorial chapters incomplete after a legacy skip", () => {
  const output = migrateSave({ saveVersion: 5, onboarding: { skipped: true, completed: { 1: true, 2: true, 3: true, 4: true, 5: true } } });
  assert.equal(output.tutorial.autoOffer, false);
  assert.deepEqual(output.tutorial.completedChapters, {});
  assert.deepEqual(output.tutorial.skippedChapters, {});
});

test("migrateSave caps migration backups instead of growing them on every retry", () => {
  const input = {
    saveVersion: 5,
    migrationBackups: {
      "v1-1": { saveVersion: 1 },
      "v2-2": { saveVersion: 2 },
      "v3-3": { saveVersion: 3 }
    }
  };

  const output = migrateSave(input);

  assert.equal(Object.keys(output.migrationBackups).length, 3);
  assert.equal(Object.hasOwn(output.migrationBackups, "v1-1"), false);
});

test("legacy meta conversion consumes the refunded source data", () => {
  const output = migrateSave({ meta: { mhp: 1 }, shards: 0 });

  assert.equal(output.currencies.voidShards, 25);
  assert.deepEqual(output.legacy.meta, {});

  output.migrationHistory = [];
  assert.equal(migrateSave(output).currencies.voidShards, 25);
});

test("tutorial migration preserves pre-existing tutorial progress", () => {
  const output = migrateSave({
    saveVersion: 5,
    tutorial: {
      version: 1,
      autoOffer: true,
      active: null,
      completedChapters: { foundations: { completedAt: "before-v6" } },
      skippedChapters: {},
      seenSteps: { existing: true }
    },
    onboarding: { completed: { 1: true } }
  });

  assert.deepEqual(output.tutorial.completedChapters, { foundations: { completedAt: "before-v6" } });
  assert.equal(output.tutorial.seenSteps.existing, true);
  assert.equal(output.tutorial.seenSteps["legacy-run-1"], true);
});

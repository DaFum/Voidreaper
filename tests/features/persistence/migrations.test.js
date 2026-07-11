import test from "node:test";
import assert from "node:assert/strict";
import { migrateSave } from "../../../src/persistence/migrations.js";

test("migrateSave preserves array-based inputs for inventory, wreckSignals, codex, challenges", () => {
  const input = {
    saveVersion: 3,
    inventory: [{ id: 'item-1', qty: 2 }],
    wreckSignals: [{ id: 'wreck-1' }],
    codex: [{ id: 'codex-1' }],
    challenges: [{ id: 'chal-1' }]
  };
  const output = migrateSave(input);

  assert.deepEqual(output.inventory, { 'item-1': { id: 'item-1', qty: 2 } });
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

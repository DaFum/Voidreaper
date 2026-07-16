import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBuildHistoryService } from '../../../src/features/codex/build-history-service.js';

test('Build History Service', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1600000000000 });
  t.mock.method(Math, 'random', () => 0.123456789);

  const saveStore = { save: { buildHistory: {} }, update(cb) { cb(this.save); return Promise.resolve(); } };
  const service = createBuildHistoryService(saveStore);

  await t.test('capture with full loadout', () => {
    const run = {
      loadout: { shipId: 's1', weaponId: 'w1', reactorId: 'r1', moduleIds: ['m1'] },
      build: { evolutions: [{ id: 'e1' }, 'e2'], tags: { totals: new Map([['t1', 1]]) } },
      seed: 'seed1'
    };

    const build = service.capture(run, 'win');
    assert.equal(build.id, 'build-1600000000000-4fzzzx');
    assert.equal(build.createdAt, '2020-09-13T12:26:40.000Z');
    assert.equal(build.ship, 's1');
    assert.equal(build.weapon, 'w1');
    assert.equal(build.reactor, 'r1');
    assert.deepEqual(build.modules, ['m1']);
    assert.deepEqual(build.evolutions, ['e1', 'e2']);
    assert.deepEqual(build.tags, [['t1', 1]]);
    assert.equal(build.seed, 'seed1');
    assert.equal(build.result, 'win');
    assert.equal(build.favorite, false);
  });

  await t.test('capture with missing loadout and minimal build', () => {
    const run = {
      build: { evolutions: [] },
      seed: 'seed2'
    };

    const build = service.capture(run, 'loss');
    assert.equal(build.ship, undefined);
    assert.equal(build.weapon, undefined);
    assert.equal(build.reactor, undefined);
    assert.deepEqual(build.modules, []);
    assert.deepEqual(build.evolutions, []);
    assert.deepEqual(build.tags, []);
    assert.equal(build.seed, 'seed2');
    assert.equal(build.result, 'loss');
    assert.equal(build.favorite, false);
  });

  await t.test('save and favorite', async () => {
    const build = { id: 'b1', value: 1 };
    await service.save(build);
    assert.deepEqual(saveStore.save.buildHistory['b1'], build);

    await service.favorite('b1', true);
    assert.equal(saveStore.save.buildHistory['b1'].favorite, true);

    await service.favorite('b1', false);
    assert.equal(saveStore.save.buildHistory['b1'].favorite, false);
  });

  await t.test('list sorts by createdAt descending', () => {
    const list = service.list({ buildHistory: { b1: { createdAt: '2020' }, b2: { createdAt: '2021' }, b3: { createdAt: '2019' } } });
    assert.equal(list[0].createdAt, '2021');
    assert.equal(list[1].createdAt, '2020');
    assert.equal(list[2].createdAt, '2019');
  });
});

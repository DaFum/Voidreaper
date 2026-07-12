import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createWeaponController } from '../../src/features/combat/weapon-controller.js';
import { createDroneController } from '../../src/features/combat/drone-controller.js';
import droneCore from '../../src/content/weapons/drone-core.js';
import mineLayer from '../../src/content/weapons/mine-layer.js';
import naniteSwarm from '../../src/content/weapons/nanite-swarm.js';

function createRunStub() {
    let nextId = 0;
    return {
        ids: { create: prefix => `${prefix}-${nextId++}` },
        player: { x: 0, y: 0, vx: 10, vy: 10 },
        summons: [],
        zones: [],
        enemies: [],
        rng: { next: () => 0.5 }
    };
}

function createServicesStub() {
    return {
        effects: { execute: () => {} },
        stats: {},
        events: { emit: () => {} },
        targeting: { find: () => null }
    };
}

describe('combat controller run isolation', () => {
    test('drone budget resets for a new run', () => {
        const controller = createWeaponController(createServicesStub());
        const firstRun = createRunStub();
        controller.equip(droneCore, firstRun);
        for (let i = 0; i < 20; i++) controller.update(4.1);
        assert.equal(controller.telemetry().activeDrones, 4);
        assert.equal(firstRun.summons.length, 4);

        const secondRun = createRunStub();
        controller.equip(droneCore, secondRun);
        assert.equal(controller.telemetry().activeDrones, 0);
        controller.update(0.1);
        assert.equal(controller.telemetry().activeDrones, 1);
        assert.equal(secondRun.summons.length, 1);
        assert.equal(firstRun.summons.length, 4, 'old run summons untouched by new run');
    });

    test('mines do not carry over into a new run', () => {
        const controller = createWeaponController(createServicesStub());
        const firstRun = createRunStub();
        controller.equip(mineLayer, firstRun);
        controller.update(0.1);
        assert.equal(controller.telemetry().activeMines, 1);

        controller.equip(mineLayer, createRunStub());
        assert.equal(controller.telemetry().activeMines, 0);
    });

    test('nanite infections do not carry over into a new run', () => {
        const controller = createWeaponController(createServicesStub());
        controller.equip(naniteSwarm, createRunStub());
        controller.fire({ id: 'enemy-1' });
        assert.equal(controller.telemetry().infected, 1);

        controller.equip(naniteSwarm, createRunStub());
        assert.equal(controller.telemetry().infected, 0);
    });
});

describe('drone controller summon sync', () => {
    test('destroy removes the drone from run.summons', () => {
        const controller = createDroneController();
        const run = createRunStub();
        const context = { run, player: run.player, findTarget: () => null };
        const drone = controller.spawn(context, 'drone-core');
        assert.equal(run.summons.length, 1);
        controller.destroy(context, drone.id);
        assert.equal(controller.drones.length, 0);
        assert.equal(run.summons.length, 0);
    });

    test('update drops drones spliced out of run.summons (sacrifice cost)', () => {
        const controller = createDroneController();
        const run = createRunStub();
        const context = { run, player: run.player, findTarget: () => null };
        controller.spawn(context, 'drone-core');
        controller.spawn(context, 'drone-core');
        run.summons.splice(0, 1);
        controller.update(context, 0.016);
        assert.equal(controller.drones.length, 1);
        assert.equal(run.summons.length, 1);
        assert.equal(controller.drones[0], run.summons[0]);
    });
});

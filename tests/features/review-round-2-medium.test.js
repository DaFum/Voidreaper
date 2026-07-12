import test from "node:test";
import assert from "node:assert/strict";
import { createWorkshopService } from "../../src/features/workshop/workshop-service.js";
import { createSocketService } from "../../src/features/equipment/socket-service.js";
import { merchantPrice, createMerchantService } from "../../src/features/merchant/merchant-service.js";
import { MERCHANT_SERVICES, CORRUPT_OFFER } from "../../src/content/merchant/merchant-pools.js";
import { createRunCurrencyService } from "../../src/features/economy/run-currency-service.js";
import { createCorruptionSystem, createCorruptionState } from "../../src/features/corruption/corruption-system.js";
import { createHitZoneIndex } from "../../src/features/ship-assembly/damage/hit-zone-index.js";
import { buildAssemblyHitZones } from "../../src/features/ship-assembly/damage/hit-zone-builder.js";
import { toBlueprintNode } from "../../src/features/ship-assembly/blueprints/blueprint-schema.js";
import { findBlueprintTarget } from "../../src/features/ship-assembly/blueprints/blueprint-matcher.js";
import { validateBlueprint } from "../../src/features/ship-assembly/blueprints/blueprint-validator.js";
import { createFaultScheduler } from "../../src/features/faults/fault-scheduler.js";
import { createArchitectController } from "../../src/features/encounters/architect-controller.js";
import { createEnergySystem } from "../../src/features/energy/energy-system.js";
import { createHeatState } from "../../src/features/heat/heat-system.js";
import { createHeatSystem } from "../../src/features/heat/heat-system.js";
import { createDailyRunService } from "../../src/features/sectors/daily-run-service.js";
import { createRunState } from "../../src/runtime/create-run-state.js";
import { createReactorService } from "../../src/features/equipment/reactor-service.js";
import { createAssemblyState } from "../../src/features/ship-assembly/model/create-assembly-state.js";
import { createAssemblyService } from "../../src/features/ship-assembly/model/assembly-service.js";
import { createFlightProfileService } from "../../src/features/ship-assembly/flight/flight-profile-service.js";
import { createIdService } from "../../src/core/ids.js";

// M5 + M6 + M12 — workshop

test("M5: reroll preserves the locked affix without growing the affix count", () => {
    const workshop = createWorkshopService({ affixRoller: { roll: () => [{ affixId: "new-a" }, { affixId: "new-b" }] } });
    const session = workshop.open(0);
    const target = { rarity: "rare", itemPower: 100, affixes: [{ affixId: "keep-me" }, { affixId: "reroll-me" }] };
    assert.equal(workshop.apply(session, "lock", target, { affixId: "keep-me" }), true);
    assert.equal(workshop.apply(session, "reroll", target, {}), true);
    assert.deepEqual(target.affixes.map(affix => affix.affixId), ["keep-me", "new-a"]);
    // Repeated rerolls stay at the rolled count instead of accumulating.
    assert.equal(workshop.apply(session, "reroll", target, {}), true);
    assert.deepEqual(target.affixes.map(affix => affix.affixId), ["keep-me", "new-a"]);
});

test("M6: workshop-opened sockets accept chips", () => {
    const workshop = createWorkshopService({});
    const session = workshop.open(2);
    const target = { sockets: [] };
    assert.equal(workshop.apply(session, "socket", target, {}), true);
    const sockets = createSocketService([{ id: "chip-alpha" }]);
    sockets.insert(target, 0, "chip-alpha");
    assert.equal(target.sockets[0].chipId, "chip-alpha");
});

test("M12: workshop stabilize/corrupt operate on corruptionLevel", () => {
    const workshop = createWorkshopService({});
    const session = workshop.open(4);
    const target = { corruptionLevel: 30, itemPower: 100 };
    workshop.apply(session, "stabilize", target, {});
    assert.equal(target.corruptionLevel, 20);
    workshop.apply(session, "corrupt", target, {});
    assert.equal(target.corruptionLevel, 32);
});

// M7 — merchant

function createMerchantRun() {
    const run = createRunState({ seed: 5 });
    run.resources.scrap = 80;
    run.resources.flux = 6;
    run.corruption = createCorruptionState();
    run.player.hull = 40;
    run.player.maxHull = 100;
    run.services = { corruption: createCorruptionSystem({}) };
    return run;
}

test("M7: services are priced by their content basePrice", () => {
    const stabilize = MERCHANT_SERVICES.find(service => service.id === "stabilize");
    assert.equal(merchantPrice(stabilize, 3, 2), 3);
    assert.ok(merchantPrice({ itemPower: 100, rarity: "rare" }) > 100);
});

test("M7: buying a service applies its effect instead of granting an item", () => {
    const merchant = createMerchantService({ currencyService: createRunCurrencyService() });
    const run = createMerchantRun();
    run.corruption.value = 40;
    const stabilize = { ...MERCHANT_SERVICES.find(service => service.id === "stabilize"), offerId: "o1", price: 3 };
    assert.equal(merchant.buy(run, stabilize), true);
    assert.equal(run.corruption.value, 30);
    assert.equal(run.resources.flux, 3);
    assert.equal(run.inventory.length, 0);

    const repair = { ...MERCHANT_SERVICES.find(service => service.id === "repair"), offerId: "o2", price: 35 };
    assert.equal(merchant.buy(run, repair), true);
    assert.equal(run.player.hull, 100);
    assert.equal(run.inventory.length, 0);
});

test("M7: the corrupted offer grants its credit alongside the corruption", () => {
    const merchant = createMerchantService({ currencyService: createRunCurrencyService() });
    const run = createMerchantRun();
    assert.equal(merchant.buy(run, { ...CORRUPT_OFFER, offerId: "o3", price: 0 }), true);
    assert.equal(run.corruption.value, 15);
    assert.equal(run.resources.scrap, 120);
    assert.equal(run.resources.flux, 8);
});

// M8 — hit zones

test("M8: capsule broadphase bounds cover the full capsule extent", () => {
    const index = createHitZoneIndex();
    const capsule = { id: "z1", shape: { kind: "capsule", length: 46, radius: 20 }, transform: { position: { x: 0, y: 0 }, rotation: 0 }, priority: 1 };
    index.rebuild(1, [capsule]);
    // A point at |x| = 40 lies inside length/2 + radius = 43 but outside the old radius-only bound of 20.
    assert.equal(index.query({ minX: 39, minY: -1, maxX: 41, maxY: 1 }).length, 1);
    assert.equal(index.query({ minX: 50, minY: 50, maxX: 51, maxY: 51 }).length, 0);
});

test("M8: frame core zones expose kind like module zones", () => {
    const snapshot = { shipFrameId: "bastion", nodes: [{ isRoot: true, nodeId: "root" }] };
    const zones = buildAssemblyHitZones(snapshot, { coreHitZone: { shape: "capsule", length: 46, radius: 20 } }, { onFallback: () => {} });
    assert.equal(zones[0].shape.kind, "capsule");
    assert.equal(zones[0].shape.length, 46);
    assert.equal(zones[0].shape.shape, undefined);
});

// M9 — blueprint port keys

test("M9: blueprint nodes record the parent port key and match ports in a new run", () => {
    const portsById = { "run1-port-1": { portId: "run1-port-1", key: "left-wing" } };
    const node = toBlueprintNode({ nodeId: "run1-node-2", parentNodeId: "run1-node-1", parentPortId: "run1-port-1", moduleInstanceId: "item-1", definitionId: "railgun", localPosition: { x: 0, y: 0 }, localRotation: 0 }, portsById);
    assert.equal(node.parentPortKey, "left-wing");

    const blueprint = { nodes: [node] };
    const newRunPort = { portId: "run2-port-9", parentNodeId: "run2-root", key: "left-wing" };
    const target = findBlueprintTarget(blueprint, newRunPort, { definitionId: "railgun" });
    assert.equal(target?.match, "exact");
});

// M10 — blueprint validation

test("M10: unknown ship frames fail validation", () => {
    const result = validateBlueprint(
        { shipFrameId: "bogus-frame", nodes: [{ blueprintNodeId: "root" }] },
        { knownShipFrameIds: new Set(["vesper"]) }
    );
    assert.equal(result.valid, false);
    assert.ok(result.issues.some(issue => issue.type === "unknown-frame"));
});

// M13 — fault scheduler

test("M13: components without disabledUntil are fault candidates", () => {
    const scheduler = createFaultScheduler({
        rng: { range: () => 0, pick: values => values[0] },
        profiles: [{ id: "weapon-projectile", light: ["jam"] }, { id: "standard", light: ["glitch"] }],
        faults: [{ id: "jam" }, { id: "glitch" }]
    });
    scheduler.update(0, { loadTier: "critical", heat: 100, corruption: 50 });
    const occurrence = scheduler.update(100, { loadTier: "critical", heat: 100, corruption: 50 }, [{ id: "railgun-1", faultProfileId: "weapon-projectile" }]);
    assert.equal(occurrence.componentId, "railgun-1");
});

// M14 — architect overload

test("M14: architect overload recalculates the energy tier", () => {
    const architect = createArchitectController();
    const run = createRunState({ seed: 9 });
    run.heat = createHeatState();
    run.services = { energy: createEnergySystem({}), heat: createHeatSystem({}), corruption: createCorruptionSystem({}) };
    run.services.energy.initialize(run.player, { capacity: 100, reserved: 92 });
    const state = architect.start({ health: 100, damageWindows: [] });
    assert.equal(architect.chooseFinal(state, "overload", run), true);
    assert.equal(run.player.energy.ratio, 1.5);
    assert.equal(run.player.energy.tier, "critical");
});

// M15 — abyssal-heart corruption

test("M15: abyssal-heart routes through the corruption system on sector entry", () => {
    const events = [];
    const eventBus = { on: () => () => {}, emit: (name, payload) => events.push({ name, payload }) };
    const reactor = createReactorService({ eventBus });
    const run = createRunState({ seed: 7 });
    run.corruption = createCorruptionState();
    run.services = { corruption: createCorruptionSystem({ eventBus }) };
    reactor.enterSector({ id: "abyssal-heart" }, { run });
    assert.equal(run.corruption.value, 5);
    const changed = events.find(event => event.name === "corruption-changed");
    assert.equal(changed.payload.previous, 0);
    assert.equal(changed.payload.value, 5);
});

// M16 — dismantle ledger

function createMountedAssembly() {
    const ids = createIdService("test-run");
    const rootNode = { nodeId: "root", parentNodeId: null, moduleInstanceId: null, definitionId: "vesper", localPosition: { x: 0, y: 0 }, localRotation: 0, mass: 24, damageState: "intact", childPortIds: ["port-1"] };
    const state = createAssemblyState({ shipFrameId: "vesper", rootNode, rootPorts: [{ portId: "port-1", key: "left-wing", parentNodeId: "root", occupiedByNodeId: null, mountType: "lateral", loadCapacity: 8, energyClass: "standard", localPosition: { x: -46, y: 0 } }] });
    const service = createAssemblyService({ state, idFactory: ids, runInventory: { store: () => null } });
    const nodeId = service.mountModule({ moduleInstanceId: "item-1", definitionId: "railgun", parentPort: state.portsById["port-1"], assemblyProfile: { visualProfileId: "weapon-mount", variantSeed: 1, sizeClass: "M", mass: 6, damage: { armor: 10, core: 10 }, childPorts: [] }, transform: { position: { x: -46, y: 0 }, rotation: 0 } });
    return { state, service, nodeId };
}

test("M16: dismantled modules do not enter the detached-items ledger", () => {
    const { state, service, nodeId } = createMountedAssembly();
    service.dismantleNode({ nodeId });
    assert.deepEqual(state.detachedItems, []);
});

test("M16: combat detaches still record into the ledger", () => {
    const { state, service, nodeId } = createMountedAssembly();
    service.detachNode({ nodeId });
    assert.equal(state.detachedItems.length, 1);
    assert.equal(state.detachedItems[0].damageState, "detached");
});

// M17 — placement preview

test("M17: previewPlacement returns a bounded rotationalInertia delta", () => {
    const flight = createFlightProfileService({ geometryService: { getSnapshot: () => null } });
    const delta = flight.previewPlacement({ localPosition: { x: 3, y: 4 } }, { mass: 2 });
    assert.equal(delta.rotationalInertia, 50);
    assert.ok(Number.isFinite(delta.lateralImbalance));
});

// M18 — daily seed

test("M18: run.seed matches the RNG used for the daily run", () => {
    const daily = createDailyRunService({});
    const run = createRunState({ seed: 12345 });
    const config = daily.config(new Date("2026-07-12T10:00:00Z"));
    daily.apply(run, config);
    assert.equal(run.seed, config.seed >>> 0);
    assert.equal(run.rng.seed, config.seed >>> 0);
});

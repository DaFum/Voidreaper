import test from "node:test";
import assert from "node:assert/strict";
import { createEventBus } from "../../../src/core/event-bus.js";
import { SHIPS } from "../../../src/content/ships/index.js";
import { RESEARCH_TREE } from "../../../src/content/research/research-tree.js";
import { TUTORIAL_EVENTS, isTutorialEvent } from "../../../src/features/tutorial/tutorial-events.js";
import { createTutorialService, shouldAutoOfferFoundations, shouldExitFoundationsRun, tutorialAvailableSystems } from "../../../src/features/tutorial/tutorial-service.js";

test("Bastion is regular research progress, not tutorial progress", () => {
  assert.deepEqual(SHIPS.filter(ship => ship.unlockSource === "onboarding"), []);
  assert.equal(RESEARCH_TREE.find(node => node.id === "engineering-load").unlocks.includes("bastion"), true);
});

test("tutorial event names are unique and recognized", () => {
  const values = Object.values(TUTORIAL_EVENTS);
  assert.equal(new Set(values).size, values.length);
  assert.equal(isTutorialEvent(TUTORIAL_EVENTS.HANGAR_TAB_OPENED), true);
  assert.equal(isTutorialEvent("click"), false);
});

function fixture(initial = {}) {
  const state = { tutorial: { version: 1, autoOffer: true, active: null, completedChapters: {}, skippedChapters: {}, seenSteps: {}, ...initial } };
  const saveStore = { async update(mutator) { mutator(state); return structuredClone(state); } };
  const eventBus = createEventBus();
  const chapters = [{ id: "foundations", title: "Grundlagen", available: () => true, steps: [
    { id: "intro", kind: "explanation", title: "Start", body: "Los" },
    { id: "move", kind: "action", event: TUTORIAL_EVENTS.MOVEMENT_USED, matches: payload => payload.magnitude > .25 },
    { id: "dodge", kind: "action", event: TUTORIAL_EVENTS.DODGE_USED }
  ] }];
  return { state, eventBus, service: createTutorialService({ saveStore, eventBus, chapters }) };
}

test("coordinator advances only from the matching successful event", async () => {
  const { service, eventBus } = fixture();
  await service.start("foundations");
  await service.advanceExplanation();
  eventBus.emit(TUTORIAL_EVENTS.MOVEMENT_USED, { magnitude: 0 });
  assert.equal(service.snapshot().active.stepId, "move");
  eventBus.emit(TUTORIAL_EVENTS.MOVEMENT_USED, { magnitude: .7 });
  await service.whenIdle();
  assert.equal(service.snapshot().active.stepId, "dodge");
  service.destroy();
});

test("duplicate events cannot advance a later tutorial step", async () => {
  const { service, eventBus } = fixture();
  await service.start("foundations");
  await service.advanceExplanation();
  eventBus.emit(TUTORIAL_EVENTS.MOVEMENT_USED, { magnitude: .7 });
  eventBus.emit(TUTORIAL_EVENTS.MOVEMENT_USED, { magnitude: .8 });
  await service.whenIdle();
  assert.equal(service.snapshot().active.stepId, "dodge");
  service.destroy();
});

test("finishing the last step announces the chapter completion exactly once", async () => {
  const { service, eventBus } = fixture();
  const completed = [];
  eventBus.on(TUTORIAL_EVENTS.CHAPTER_COMPLETED, payload => completed.push(payload.chapterId));
  await service.start("foundations");
  await service.advanceExplanation();
  eventBus.emit(TUTORIAL_EVENTS.MOVEMENT_USED, { magnitude: .7 });
  await service.whenIdle();
  assert.deepEqual(completed, []);
  eventBus.emit(TUTORIAL_EVENTS.DODGE_USED, {});
  await service.whenIdle();
  assert.deepEqual(completed, ["foundations"]);
  assert.equal(service.snapshot().active, null);
  assert.equal(service.snapshot().completedChapters.foundations, true);
  service.destroy();
});

test("a failed save does not announce a false completion", async () => {
  const state = { tutorial: { version: 1, autoOffer: true, active: null, completedChapters: {}, skippedChapters: {}, seenSteps: {} } };
  let failNext = false;
  const saveStore = { async update(mutator) { mutator(state); if (failNext) throw new Error("disk full"); return structuredClone(state); } };
  const eventBus = createEventBus();
  const errors = [], completed = [];
  eventBus.on(TUTORIAL_EVENTS.CHAPTER_COMPLETED, payload => completed.push(payload.chapterId));
  const chapters = [{ id: "foundations", title: "Grundlagen", available: () => true, steps: [
    { id: "intro", kind: "explanation" },
    { id: "dodge", kind: "action", event: TUTORIAL_EVENTS.DODGE_USED }
  ] }];
  const service = createTutorialService({ saveStore, eventBus, chapters, onPersistenceError: error => errors.push(error) });
  await service.start("foundations");
  await service.advanceExplanation();
  failNext = true;
  eventBus.emit(TUTORIAL_EVENTS.DODGE_USED, {});
  await service.whenIdle();
  assert.equal(errors.length, 1);
  assert.deepEqual(completed, []);
  service.destroy();
});

test("stopping or skipping a chapter does not announce a completion", async () => {
  const { service, eventBus } = fixture();
  const completed = [];
  eventBus.on(TUTORIAL_EVENTS.CHAPTER_COMPLETED, payload => completed.push(payload.chapterId));
  await service.start("foundations");
  await service.stop();
  await service.start("foundations");
  await service.skipChapter();
  assert.deepEqual(completed, []);
  service.destroy();
});

test("pause, replay, skip and unknown saved steps remain safe", async () => {
  const { service, state } = fixture({ active: { chapterId: "foundations", stepId: "removed", mode: "guided", paused: false } });
  service.hydrate(state.tutorial);
  assert.equal(service.snapshot().active.stepId, "intro");
  await service.pause();
  assert.equal(service.snapshot().active.paused, true);
  await service.resume();
  await service.skipChapter();
  assert.equal(state.tutorial.skippedChapters.foundations, true);
  assert.equal(state.tutorial.autoOffer, false);
  await service.start("foundations", { mode: "replay" });
  assert.equal(service.snapshot().active.mode, "replay");
  service.destroy();
});

test("availability ids keep chapters staggered until their system is discovered", () => {
  const state = { tutorial: { version: 1, autoOffer: false, active: null, completedChapters: {}, skippedChapters: {}, seenSteps: {} } };
  const service = createTutorialService({
    saveStore: { async update(mutator) { mutator(state); return structuredClone(state); } },
    eventBus: createEventBus(),
    chapters: [
      { id: "always", title: "Always", steps: [{ id: "intro", kind: "explanation" }] },
      { id: "later", title: "Later", availabilityId: "campaign-map", steps: [{ id: "intro", kind: "explanation" }] }
    ]
  });
  service.hydrate(state.tutorial);
  assert.deepEqual(service.available().map(chapter => chapter.available), [true, false]);
  assert.deepEqual(service.available({ availableSystems: ["campaign-map"] }).map(chapter => chapter.available), [true, true]);
  state.tutorial.completedChapters.later = true;
  service.hydrate(state.tutorial);
  assert.equal(service.available().find(chapter => chapter.id === "later").available, true);
  service.destroy();
});

test("research stays locked until the profile can perform its interactive step", () => {
  const fresh = { currencies: { voidShards: 0, bossCores: 0, anomalyData: 0, salvageFragments: 0 }, research: {}, profile: { totalRuns: 0 }, statistics: { runs: 0 }, unlocks: {} };
  assert.deepEqual(tutorialAvailableSystems(fresh), ["loadout"]);
  assert.deepEqual(tutorialAvailableSystems(fresh, { canResearch: true }), ["loadout", "research"]);
  assert.deepEqual(tutorialAvailableSystems(fresh, { campaignMapDiscovered: true }), ["loadout", "campaign-map"]);
});

test("legacy skipped foundations are not offered again after reload", () => {
  assert.equal(shouldAutoOfferFoundations({ autoOffer: true, active: null, completedChapters: {}, skippedChapters: { foundations: true } }), false);
  assert.equal(shouldAutoOfferFoundations({ autoOffer: true, active: null, completedChapters: {}, skippedChapters: {} }), true);
});

test("foundations exits its isolated run after completion, skip, or stop", () => {
  const foundations = { active: { chapterId: "foundations" } };
  assert.equal(shouldExitFoundationsRun(foundations, { active: null }), true);
  assert.equal(shouldExitFoundationsRun(foundations, { active: { chapterId: "run-navigation" } }), true);
  assert.equal(shouldExitFoundationsRun({ active: { chapterId: "run-navigation" } }, { active: null }), false);
  assert.equal(shouldExitFoundationsRun(foundations, foundations), false);
});

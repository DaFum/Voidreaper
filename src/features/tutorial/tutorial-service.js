import { TUTORIAL_EVENTS } from "./tutorial-events.js";

const clone = value => structuredClone(value);

export function tutorialAvailableSystems(metaSave = {}, { checkpoint = null, canResearch = false, campaignMapDiscovered = false } = {}) {
  const systems = ["loadout"];
  if (canResearch) systems.push("research");
  const hasRunExperience = Boolean(checkpoint || metaSave.statistics?.runs > 0 || metaSave.profile?.totalRuns > 0);
  if (campaignMapDiscovered || hasRunExperience) systems.push("campaign-map");
  if (metaSave.unlocks?.corruption || hasRunExperience) systems.push("corruption");
  return systems;
}

export function shouldAutoOfferFoundations(tutorial = {}) {
  return Boolean(tutorial.autoOffer && !tutorial.active && !tutorial.completedChapters?.foundations && !tutorial.skippedChapters?.foundations);
}

export function shouldExitFoundationsRun(before = {}, after = {}) {
  return before.active?.chapterId === "foundations" && after.active?.chapterId !== "foundations";
}

export function createTutorialService({ saveStore, eventBus, chapters, onPersistenceError = () => {} }) {
  const byId = new Map(chapters.map(chapter => [chapter.id, chapter]));
  const listeners = new Set(); let state = null; let queue = Promise.resolve(); const offs = [];
  const chapterFor = id => byId.get(id) ?? null;
  const normalizedActive = active => {
    if (!active) return null; const chapter = chapterFor(active.chapterId); if (!chapter) return null;
    const stepId = chapter.steps.some(step => step.id === active.stepId) ? active.stepId : chapter.steps[0]?.id;
    return stepId ? { mode: "guided", paused: false, ...active, stepId } : null;
  };
  const notify = () => { const snap = api.snapshot(); for (const listener of listeners) listener(snap); };
  const persist = (mutator, afterCommit) => {
    queue = queue.then(async () => { try { const saved = await saveStore.update(save => { mutator(save.tutorial); state = clone(save.tutorial); }); state = clone(saved.tutorial); afterCommit?.(); notify(); } catch (error) { onPersistenceError(error); notify(); } });
    return queue;
  };
  const current = () => { const chapter = chapterFor(state?.active?.chapterId); return { chapter, step: chapter?.steps.find(step => step.id === state?.active?.stepId) ?? null }; };
  const advance = expected => { let completedChapterId = null; return persist(tutorial => { const chapter = chapterFor(tutorial.active?.chapterId), step = chapter?.steps.find(item => item.id === tutorial.active?.stepId); if (!chapter || !step || expected && (expected.chapterId !== chapter.id || expected.stepId !== step.id)) return; const index = chapter.steps.indexOf(step); tutorial.seenSteps[`${chapter.id}:${step.id}`] = true; if (index === chapter.steps.length - 1) { tutorial.completedChapters[chapter.id] = true; tutorial.active = null; completedChapterId = chapter.id; } else tutorial.active = { ...tutorial.active, stepId: chapter.steps[index + 1].id }; },
    // Announce completion only once the save has actually committed — persist() swallows write
    // failures in its catch, so emitting from a trailing .then() would fire on a failed save too.
    () => { if (completedChapterId) eventBus.emit(TUTORIAL_EVENTS.CHAPTER_COMPLETED, { chapterId: completedChapterId }); }); };

  // MICRO-OPTIMIZATION: Avoid intermediate array allocations (.flatMap, .map, .filter)
  // when extracting unique event names for the tutorial service.
  // Nested for...of loops and a direct Set.add() avoid garbage collection overhead and V8 slowdowns.
  const uniqueEvents = new Set();
  for (const chapter of chapters) {
    for (const step of chapter.steps) {
      if (step.event) uniqueEvents.add(step.event);
    }
  }

  for (const eventName of uniqueEvents) offs.push(eventBus.on(eventName, payload => { const { chapter, step } = current(); if (!state?.active?.paused && step?.kind === "action" && step.event === eventName && (!step.matches || step.matches(payload))) void advance({ chapterId: chapter.id, stepId: step.id }); }));
  const api = {
    hydrate(tutorial) { state = clone(tutorial); state.active = normalizedActive(state.active); notify(); return this.snapshot(); },
    snapshot() { if (!state) return { active: null, completedChapters: {}, skippedChapters: {}, seenSteps: {} }; const { chapter, step } = current(); return { ...clone(state), active: state.active ? { ...clone(state.active), chapter, step, stepIndex: chapter.steps.indexOf(step), stepCount: chapter.steps.length } : null }; },
    available(context = {}) { const systems = new Set(context.availableSystems ?? []); return chapters.map(chapter => { const completed=Boolean(state?.completedChapters?.[chapter.id]); return { ...chapter, available: completed || chapter.available?.(context) !== false && (!chapter.availabilityId || systems.has(chapter.availabilityId)), completed, skipped: Boolean(state?.skippedChapters?.[chapter.id]), active: state?.active?.chapterId === chapter.id }; }); },
    start(chapterId, { mode = "guided" } = {}) { const chapter = chapterFor(chapterId); if (!chapter || chapter.available?.({}) === false) return Promise.resolve(false); return persist(tutorial => { tutorial.active = { chapterId, stepId: chapter.steps[0].id, mode, paused: false }; delete tutorial.skippedChapters[chapterId]; }); },
    pause() { return persist(tutorial => { if (tutorial.active) tutorial.active.paused = true; }); },
    resume() { return persist(tutorial => { if (tutorial.active) tutorial.active.paused = false; }); },
    back() { return persist(tutorial => { const { chapter, step } = current(); const index = chapter?.steps.indexOf(step) ?? 0; if (tutorial.active && index > 0) tutorial.active.stepId = chapter.steps[index - 1].id; }); },
    advanceExplanation() { const { chapter, step } = current(); return step?.kind === "explanation" || step?.optional ? advance({ chapterId: chapter.id, stepId: step.id }) : Promise.resolve(false); },
    skipChapter() { return persist(tutorial => { if (!tutorial.active) return; const chapterId = tutorial.active.chapterId; tutorial.skippedChapters[chapterId] = true; if (chapterId === "foundations") tutorial.autoOffer = false; tutorial.active = null; }); },
    stop() { return persist(tutorial => { tutorial.active = null; }); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }, whenIdle() { return queue; },
    destroy() { for (const off of offs) off?.(); listeners.clear(); }
  };
  return api;
}

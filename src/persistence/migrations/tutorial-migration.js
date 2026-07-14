export const createTutorialState = ({ autoOffer = true } = {}) => ({
  version: 1,
  autoOffer,
  active: null,
  completedChapters: {},
  skippedChapters: {},
  seenSteps: {}
});

export function migrateTutorialSave(save, { fromVersion = 0, legacyOnboarding, existingTutorial } = {}) {
  if (fromVersion < 6) {
    const existing = existingTutorial ?? {};
    const tutorial = {
      ...createTutorialState({ autoOffer: false }),
      ...existing,
      completedChapters: { ...(existing.completedChapters ?? {}) },
      skippedChapters: { ...(existing.skippedChapters ?? {}) },
      seenSteps: { ...(existing.seenSteps ?? {}) }
    };
    for (const [run, completed] of Object.entries(legacyOnboarding?.completed ?? {})) {
      if (completed) tutorial.seenSteps[`legacy-run-${run}`] = true;
    }
    save.tutorial = tutorial;
  } else save.tutorial = { ...createTutorialState(), ...(save.tutorial ?? {}) };
  delete save.onboarding;
  return save;
}

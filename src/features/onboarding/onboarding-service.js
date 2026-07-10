import { ONBOARDING_STEPS } from "../../content/onboarding/onboarding-steps.js";

export function createOnboardingService(saveStore) {
  return {
    current(save) { if (save.onboarding.skipped) return null; return ONBOARDING_STEPS.find(step => !save.onboarding.completed[step.run]) ?? null; },
    restrictions(save) { const step = this.current(save); return step ? { allowed: step.unlocks, run: step.run } : { allowed: null, run: null }; },
    async complete(runNumber) { return saveStore.update(save => { save.onboarding.completed[runNumber] = true; for (const unlock of ONBOARDING_STEPS.find(step => step.run === runNumber)?.unlocks ?? []) save.unlocks[unlock] = true; }); },
    async skip() { return saveStore.update(save => { save.onboarding.skipped = true; for (const step of ONBOARDING_STEPS) { save.onboarding.completed[step.run] = true; for (const unlock of step.unlocks) save.unlocks[unlock] = true; } }); }
  };
}

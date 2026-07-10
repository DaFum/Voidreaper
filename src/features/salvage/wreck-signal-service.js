import { assertWreckSignal } from "./wreck-signal-schema.js";

const deepFreeze = value => { if (value && typeof value === "object") { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; };
export function createWreckSignalService() {
  return {
    create(item, run = {}) { const snapshot = deepFreeze(structuredClone(item)); const corruption = run.corruption ?? 0; return assertWreckSignal({ id: `wreck-${item.instanceId}-${run.totalRuns ?? 0}`, itemSnapshot: snapshot, regionId: run.regionId ?? "shattered-approach", corruption, deathCause: run.deathCause ?? "hull-collapse", modifiers: [corruption >= 75 ? "corrupted-hunters" : "echo-affixes", run.deathCause === "overheat" ? "thermal-storm" : "wreck-field"], createdAtRun: run.totalRuns ?? 0, visibleAfterRun: (run.totalRuns ?? 0) + 1, expiresAfterRun: (run.totalRuns ?? 0) + 6, status: "latent" }); },
    refresh(signals, totalRuns) { for (const signal of Object.values(signals)) { if (totalRuns >= signal.expiresAfterRun && signal.status !== "recovered") signal.status = "expired"; else if (totalRuns >= signal.visibleAfterRun && signal.status === "latent") signal.status = "visible"; } return signals; },
    visible(signals) { return Object.values(signals).filter(signal => signal.status === "visible"); }
  };
}

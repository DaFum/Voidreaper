const loadId = Math.floor(Math.random() * 1679616).toString(36).padStart(4, "0");
let counter = 0;

export function createRuntimeId(prefix = "runtime") {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${loadId}-${counter.toString(36)}`;
}

export function createIdService(runId = "run", restoredCounter = 0) {
  let runCounter = Math.max(0, Number(restoredCounter) || 0);
  return {
    create(prefix = "runtime") {
      runCounter += 1;
      return `${runId}-${prefix}-${runCounter.toString(36)}`;
    },
    snapshot() { return runCounter; },
    restore(value) { const next = Math.max(0, Math.floor(Number(value) || 0)); if (next > runCounter) runCounter = next; },
    get prefix() { return runId; }
  };
}

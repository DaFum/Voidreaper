const loadId = Math.random().toString(36).substring(2, 6);
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
    snapshot() { return runCounter; }
  };
}

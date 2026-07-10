let counter = 0;

export function createRuntimeId(prefix = "runtime") {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function createIdService(runId = "run") {
  let runCounter = 0;
  return {
    create(prefix = "runtime") {
      runCounter += 1;
      return `${runId}-${prefix}-${runCounter.toString(36)}`;
    }
  };
}

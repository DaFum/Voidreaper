const REQUIRED = ["id", "createState", "start", "update", "isComplete", "getHud", "finish"];

export function assertObjective(objective) {
  for (const field of REQUIRED) {
    if (field === "id" ? typeof objective[field] !== "string" : typeof objective[field] !== "function") {
      throw new Error(`Invalid objective field: ${field}`);
    }
  }
  return objective;
}

export function createProgressObjective({ id, label, target, contribution = () => 0 }) {
  return assertObjective({
    id,
    createState: () => ({ progress: 0, target, started: false }),
    start(_context, state) { state.started = true; },
    update(context, state, dt) { state.progress = Math.min(state.target, state.progress + contribution(context, dt, state)); },
    isComplete: (_context, state) => state.progress >= state.target,
    getHud: (_context, state) => ({ label, value: state.progress, maximum: state.target }),
    finish(_context, state) { state.finished = true; }
  });
}

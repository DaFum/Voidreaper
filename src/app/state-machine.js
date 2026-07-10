export const APP_STATES = Object.freeze([
  "menu",
  "hangar",
  "run",
  "levelup",
  "pause",
  "sector",
  "gameover"
]);

const TRANSITIONS = {
  menu: ["hangar", "run"],
  hangar: ["menu", "run"],
  run: ["levelup", "pause", "sector", "gameover"],
  levelup: ["run", "gameover"],
  pause: ["run", "hangar", "gameover"],
  sector: ["run", "hangar", "gameover"],
  gameover: ["menu", "hangar", "run"]
};

export function createStateMachine(initialState = "menu", eventBus) {
  if (!APP_STATES.includes(initialState)) throw new Error(`Unknown initial state: ${initialState}`);
  let state = initialState;
  return {
    get state() { return state; },
    can(nextState) { return TRANSITIONS[state]?.includes(nextState) ?? false; },
    transition(nextState, detail = {}) {
      if (!this.can(nextState)) throw new Error(`Invalid state transition: ${state} -> ${nextState}`);
      const previousState = state;
      state = nextState;
      eventBus?.emit("state-changed", { previousState, state, detail });
      return state;
    }
  };
}

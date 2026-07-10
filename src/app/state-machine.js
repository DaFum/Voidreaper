export const APP_STATES = Object.freeze([
  "menu",
  "hangar",
  "run",
  "levelup",
  "pause",
  "sector-map",
  "merchant",
  "workshop",
  "anomaly",
  "extraction",
  "sector-summary",
  "abyss-transition",
  "gameover"
]);

const TRANSITIONS = {
  menu: ["hangar", "run"],
  hangar: ["menu", "run"],
  run: ["levelup", "pause", "sector-map", "extraction", "sector-summary", "abyss-transition", "gameover"],
  levelup: ["run", "gameover"],
  pause: ["run", "hangar", "gameover"],
  "sector-map": ["run", "merchant", "workshop", "anomaly", "extraction", "hangar", "gameover"],
  merchant: ["sector-map", "hangar", "gameover"],
  workshop: ["sector-map", "hangar", "gameover"],
  anomaly: ["sector-map", "run", "hangar", "gameover"],
  extraction: ["run", "sector-map", "hangar", "abyss-transition", "gameover"],
  "sector-summary": ["sector-map", "extraction", "abyss-transition", "hangar"],
  "abyss-transition": ["run", "extraction", "hangar"],
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

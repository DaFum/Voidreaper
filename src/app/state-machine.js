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
  ,"quick-mount"
  ,"assembly-workbench"
]);

const TRANSITIONS = {
  menu: ["hangar", "run"],
  hangar: ["menu", "run"],
  run: ["levelup", "pause", "quick-mount", "sector-map", "extraction", "sector-summary", "abyss-transition", "gameover"],
  "quick-mount": ["run", "sector-map", "gameover"],
  levelup: ["run", "gameover"],
  pause: ["run", "hangar", "gameover"],
  "sector-map": ["run", "merchant", "workshop", "assembly-workbench", "anomaly", "extraction", "hangar", "gameover"],
  "assembly-workbench": ["sector-map", "workshop", "hangar", "gameover"],
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
  let previousState = null;
  return {
    get state() { return state; },
    can(nextState) { return TRANSITIONS[state]?.includes(nextState) ?? false; },
    transition(nextState, detail = {}) {
      if (!this.can(nextState)) throw new Error(`Invalid state transition: ${state} -> ${nextState}`);
      previousState = state;
      state = nextState;
      eventBus?.emit("state-changed", { previousState, state, detail });
      return state;
    },
    returnToPrevious() { if (!previousState) return state; const target=previousState;if(!this.can(target))return state;previousState=null;const current=state;state=target;eventBus?.emit("state-changed",{previousState:current,state,detail:{returned:true}});return state; }
  };
}

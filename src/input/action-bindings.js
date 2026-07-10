export const ACTIONS = Object.freeze({
  PAUSE: "pause",
  DODGE: "dodge",
  ACTIVE_1: "active-1",
  ACTIVE_2: "active-2"
});

export const DEFAULT_BINDINGS = Object.freeze({
  KeyW: "move-up",
  ArrowUp: "move-up",
  KeyS: "move-down",
  ArrowDown: "move-down",
  KeyA: "move-left",
  ArrowLeft: "move-left",
  KeyD: "move-right",
  ArrowRight: "move-right",
  Space: ACTIONS.DODGE,
  KeyQ: ACTIONS.ACTIVE_1,
  KeyE: ACTIONS.ACTIVE_2,
  KeyP: ACTIONS.PAUSE,
  Escape: ACTIONS.PAUSE
});

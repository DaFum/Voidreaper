export const ACTIONS = Object.freeze({
  PAUSE: "pause",
  DODGE: "dodge",
  ACTIVE_1: "active-1",
  ACTIVE_2: "active-2"
});
export const ASSEMBLY_ACTIONS=Object.freeze({PREVIOUS_SUGGESTION:"assembly-previous",NEXT_SUGGESTION:"assembly-next",CONFIRM:"assembly-confirm",DETAILS:"assembly-details",DEFER:"assembly-defer"});
export const QUICK_MOUNT_BINDINGS=Object.freeze({KeyA:ASSEMBLY_ACTIONS.PREVIOUS_SUGGESTION,ArrowLeft:ASSEMBLY_ACTIONS.PREVIOUS_SUGGESTION,KeyD:ASSEMBLY_ACTIONS.NEXT_SUGGESTION,ArrowRight:ASSEMBLY_ACTIONS.NEXT_SUGGESTION,Enter:ASSEMBLY_ACTIONS.CONFIRM,Tab:ASSEMBLY_ACTIONS.DETAILS,Escape:ASSEMBLY_ACTIONS.DEFER});

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

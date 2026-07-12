import { ACTIONS, ASSEMBLY_ACTIONS, DEFAULT_BINDINGS, QUICK_MOUNT_BINDINGS } from "./action-bindings.js";
import { createTouchStick } from "./touch-stick.js";

export function createInputController({ eventBus, bindings = {}, stickElement, stickKnob, isQuickMount = () => false } = {}) {
  const resolvedBindings = { ...DEFAULT_BINDINGS, ...bindings };
  const held = new Set();
  const stick = createTouchStick(stickElement, stickKnob);

  const onKeyDown = event => {
    if (event.target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable)) return;
    if(isQuickMount()){const assemblyAction=QUICK_MOUNT_BINDINGS[event.code];if(assemblyAction){if(!event.repeat)eventBus?.emit("action",{action:assemblyAction,source:"keyboard"});event.preventDefault();event.stopImmediatePropagation();return;}}
    const action = resolvedBindings[event.code];
    if (!action) return;
    if (!event.repeat && (Object.values(ACTIONS).includes(action)||Object.values(ASSEMBLY_ACTIONS).includes(action))) eventBus?.emit("action", { action, source: "keyboard" });
    held.add(action);
    event.preventDefault();
  };
  const onKeyUp = event => {
    const action = resolvedBindings[event.code];
    if (action) held.delete(action);
  };

  return {
    start() {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
    },
    stop() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      held.clear();
      stick.reset();
    },
    axis() {
      const keyboardX = Number(held.has("move-right")) - Number(held.has("move-left"));
      const keyboardY = Number(held.has("move-down")) - Number(held.has("move-up"));
      const x = keyboardX || stick.state.x;
      const y = keyboardY || stick.state.y;
      const magnitude = Math.sqrt((x)*(x) + (y)*(y));
      return magnitude > 1 ? { x: x / magnitude, y: y / magnitude } : { x, y };
    },
    trigger(action, source = "touch") {
      eventBus?.emit("action", { action, source });
    },
    rebind(action, code) { for (const [key, bound] of Object.entries(resolvedBindings)) if (bound === action) delete resolvedBindings[key]; resolvedBindings[code] = action; return { ...resolvedBindings }; },
    bindings: resolvedBindings
  };
}

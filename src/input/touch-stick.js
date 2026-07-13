import { clamp } from "../core/math.js";

export function createTouchStick(element, knob, radius = 56) {
  const state = { pointerId: null, originX: 0, originY: 0, x: 0, y: 0 };

  function update(clientX, clientY) {
    const dx = clientX - state.originX;
    const dy = clientY - state.originY;
    const length = Math.sqrt((dx)*(dx) + (dy)*(dy)) || 1;
    const scale = Math.min(1, radius / length);
    const px = dx * scale;
    const py = dy * scale;
    state.x = clamp(px / radius, -1, 1);
    state.y = clamp(py / radius, -1, 1);
    if (knob) knob.style.transform = `translate(${px}px, ${py}px)`;
  }

  function reset() {
    state.pointerId = null;
    state.x = 0;
    state.y = 0;
    if (knob) knob.style.transform = "translate(0, 0)";
  }

  element?.addEventListener("pointerdown", event => {
    if (state.pointerId !== null) return;
    state.pointerId = event.pointerId;
    state.originX = event.clientX;
    state.originY = event.clientY;
    element.setPointerCapture?.(event.pointerId);
    update(event.clientX, event.clientY);
  });
  element?.addEventListener("pointermove", event => {
    if (event.pointerId === state.pointerId) update(event.clientX, event.clientY);
  });
  element?.addEventListener("pointerup", event => { if (event.pointerId === state.pointerId) reset(); });
  element?.addEventListener("pointercancel", event => { if (event.pointerId === state.pointerId) reset(); });

  return { state, reset };
}

import { clamp } from "../../core/math.js";

const setMeter = (root, name, ratio, label) => {
  const meter = root?.querySelector(`[data-resource="${name}"]`);
  if (!meter) return;
  meter.style.setProperty("--fill", `${clamp(ratio, 0, 1) * 100}%`);
  meter.querySelector("b").textContent = label;
};

export function updateResourceMeters(root, { energy, heat, corruption, load }) {
  setMeter(root, "energy", energy.maximum ? energy.value / energy.maximum : 0, `${Math.ceil(energy.value)} / ${energy.maximum}`);
  setMeter(root, "heat", heat / 100, `${Math.round(heat)}°`);
  setMeter(root, "corruption", Math.min(corruption, 100) / 100, `${Math.round(corruption)}%`);
  setMeter(root, "load", Math.min(load.ratio, 1.6) / 1.6, `${Math.round(load.ratio * 100)}% ${load.tier.toUpperCase()}`);
  root?.setAttribute("data-load-tier", load.tier);
}

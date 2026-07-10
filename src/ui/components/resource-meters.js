import { clamp } from "../../core/math.js";

const setMeter = (root, name, ratio, label) => {
  const meter = root?.querySelector(`[data-resource="${name}"]`);
  if (!meter) return;
  meter.style.setProperty("--fill", `${clamp(ratio, 0, 1) * 100}%`);
  meter.querySelector("b").textContent = label;
};

export function updateResourceMeters(root, { energy, heat, corruption, load, scrap = 0, flux = 0 }) {
  setMeter(root, "energy", energy.maximum ? energy.value / energy.maximum : 0, `${Math.ceil(energy.value)} / ${energy.maximum}`);
  setMeter(root, "heat", heat / 100, `${Math.round(heat)}°`);
  setMeter(root, "corruption", Math.min(corruption, 100) / 100, `${Math.round(corruption)}%`);
  const loadRatio = load?.ratio ?? 0;
  const loadTier = load?.tier ?? "stable";
  setMeter(root, "load", Math.min(loadRatio, 1.6) / 1.6, `${Math.round(loadRatio * 100)}% ${loadTier.toUpperCase()}`);
  root?.setAttribute("data-scrap", String(scrap));
  root?.setAttribute("data-flux", String(flux));
  root?.setAttribute("data-load-tier", loadTier);
  root?.setAttribute("data-heat-tier", heat >= 100 ? "overheated" : heat >= 85 ? "unstable" : heat >= 60 ? "warm" : "cold");
  root?.setAttribute("data-corruption-tier", corruption >= 100 ? "abyssal" : corruption >= 75 ? "transformed" : corruption >= 50 ? "breach" : corruption >= 25 ? "tainted" : "stable");
}

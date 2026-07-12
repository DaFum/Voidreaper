import { escapeHtml } from "../escape-html.js";
const TOGGLES = [["reducedMotion","Reduced Motion"],["screenShake","Screen Shake"],["damageFlashes","Damage Flashes"],["crt","CRT Overlay"],["largeTouchControls","Große Touch-Buttons"],["colorPatterns","Zustandsmuster"]];
export function renderSettingsScreen(root, settings, onChange) {
  const codeFor = (action, fallback) => Object.entries(settings.bindings).find(([, bound]) => bound === action)?.[0] ?? fallback;
  root.innerHTML = `<section class="service-screen"><header>ACCESSIBILITY / CONTROLS <b>LIVE SAVE</b></header>${TOGGLES.map(([id,label]) => `<label><input type="checkbox" data-setting="${id}" ${settings[id] ? "checked" : ""}> ${escapeHtml(label)}</label>`).join("")}<label>UI-Skalierung <input type="range" min=".8" max="1.4" step=".1" value="${escapeHtml(settings.uiScale)}" data-setting="uiScale"></label><label>Dodge <input value="${escapeHtml(codeFor("dodge", "Space"))}" data-binding="dodge" readonly placeholder="Taste drücken"></label><label>Aktivmodul 1 <input value="${escapeHtml(codeFor("active-1", "KeyQ"))}" data-binding="active-1" readonly placeholder="Taste drücken"></label><label>Aktivmodul 2 <input value="${escapeHtml(codeFor("active-2", "KeyE"))}" data-binding="active-2" readonly placeholder="Taste drücken"></label></section>`;
  root.onchange = event => { const setting = event.target.dataset.setting; if (setting) settings[setting] = event.target.type === "checkbox" ? event.target.checked : Number(event.target.value); document.documentElement.style.setProperty("--ui-scale", settings.uiScale); document.documentElement.dataset.reducedMotion = String(settings.reducedMotion); document.documentElement.dataset.colorPatterns = String(settings.colorPatterns); onChange(settings); };
  // Bindings are captured from the keydown itself (event.code), never from typed
  // text — a typed "f" is not the code "KeyF" and would silently break the action.
  // If the pressed key already belongs to another action, the two actions swap
  // codes so nothing is silently left unbound.
  root.onkeydown = event => {
    const binding = event.target.dataset?.binding;
    if (!binding || event.code === "Tab") return;
    event.preventDefault();
    const previousCode = Object.entries(settings.bindings).find(([, action]) => action === binding)?.[0] ?? null;
    const displacedAction = settings.bindings[event.code] !== binding ? settings.bindings[event.code] : null;
    for (const [code, action] of Object.entries(settings.bindings)) if (action === binding || code === event.code) delete settings.bindings[code];
    settings.bindings[event.code] = binding;
    event.target.value = event.code;
    if (displacedAction) {
      if (previousCode && previousCode !== event.code) settings.bindings[previousCode] = displacedAction;
      const displacedInput = root.querySelector(`[data-binding="${displacedAction}"]`);
      if (displacedInput) displacedInput.value = previousCode ?? "";
    }
    onChange(settings);
  };
}

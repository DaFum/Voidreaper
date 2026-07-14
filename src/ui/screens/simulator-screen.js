import { SIMULATOR_ENEMIES } from "../../features/simulator/simulator-enemies.js";
import { escapeHtml } from "../escape-html.js";


export function renderSimulatorScreen(root, { config = {}, summary, onStart }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen"><header>BUILD SIMULATOR <b>NO REWARDS · IMMUTABLE VAULT</b></header><div class="codex__filters"><label>Gegner <select data-enemy>${SIMULATOR_ENEMIES.map(enemy => `<option value="${enemy.id}"${config.enemyId === enemy.id ? " selected" : ""}>${escapeHtml(enemy.name)}</option>`).join("")}</select></label><label>Dichte <input data-density type="number" min=".5" max="5" step=".5" value="${config.density ?? 1}"></label><label>Dauer (s) <input data-duration type="number" min="15" max="300" value="${config.duration ?? 60}"></label><label>Seed <input data-seed type="number" value="${config.seed ?? 1}"></label></div>${summary ? `<div class="summary-grid"><p>DPS <b>${summary.dps.toFixed(1)}</b></p><p>Trigger <b>${summary.triggers}</b></p><p>Fehler <b>${summary.faults.length}</b></p><p>Seed <b>${summary.seed}</b></p></div>` : ""}<button class="btn" data-start>Simulation starten</button></section>`;
  root.querySelector("[data-start]").addEventListener("click", () => onStart({ enemyId: root.querySelector("[data-enemy]").value, density: Number(root.querySelector("[data-density]").value), duration: Number(root.querySelector("[data-duration]").value), seed: Number(root.querySelector("[data-seed]").value) }));
}

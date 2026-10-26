import { escapeHtml } from "../escape-html.js";
export function renderAbyssTransition(root, { profile, onExtract, onDescend }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen abyss"><header>ARCHITECT TERMINATED <b>ABYSS ${escapeHtml(profile.depth)}</b></header><h2>THE SIGNAL CONTINUES BELOW.</h2><p>Gegner ×${escapeHtml(profile.enemyMultiplier.toFixed(2))} · Eliten ×${escapeHtml(profile.eliteMultiplier.toFixed(2))} · Korruption +${escapeHtml(profile.corruptionGain)}</p><button type="button" class="btn" data-descend>In den Abyss</button><button type="button" class="btn gold" data-extract>Sicher extrahieren</button></section>`;
  root.querySelector("[data-descend]").addEventListener("click", onDescend);
  root.querySelector("[data-extract]").addEventListener("click", onExtract);
}

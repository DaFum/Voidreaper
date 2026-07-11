import { escapeHtml } from "../escape-html.js";
export function renderStatistics(root, statistics, records) {
  root.innerHTML = `<section class="service-screen"><header>LOCAL TELEMETRY <b>NO EXTERNAL TRANSMISSION</b></header><div class="summary-grid">${[["Runs",statistics.runs],["Siege",statistics.victories],["Kills",statistics.kills],["Spielzeit",Math.round((statistics.playTime ?? 0)/60)+"m"],["Prototypen extrahiert",statistics.extractedPrototypes],["Prototypen verloren",statistics.lostPrototypes],["Highscore",records.highscore?.value ?? 0],["Abyss",records.abyssDepth?.value ?? 0]].map(([label,value]) => `<p>${escapeHtml(label)}<b>${value}</b></p>`).join("")}</div></section>`;
}

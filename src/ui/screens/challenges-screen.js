import { escapeHtml } from "../escape-html.js";
export function renderChallengesScreen(root, challenges, progress = {}) {
  root.innerHTML = `<section class="codex"><header>CHALLENGE UPLINK <b>${Object.values(progress).filter(value => value.claimed).length}/${challenges.length}</b></header><div class="codex__grid">${challenges.map(challenge => `<article data-level="${progress[challenge.id]?.claimed ? "mastered" : "observed"}"><span>${escapeHtml(challenge.category)}</span><h3>${escapeHtml(challenge.name)}</h3><p>${escapeHtml(challenge.description)}</p><small>${Object.entries(challenge.reward).map(([key, value]) => `${value} ${escapeHtml(key)}`).join(" · ")}</small></article>`).join("")}</div></section>`;
}

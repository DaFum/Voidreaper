import { escapeHtml } from "../escape-html.js";
export function renderChallengesScreen(root, challenges, progress = {}) {
  // ⚡ Bolt: Use imperative loop to avoid intermediate array allocation from Object.values().filter().length
  let claimedCount = 0;
  for (const key in progress) {
    if (Object.hasOwn(progress, key) && progress[key]?.claimed) {
      claimedCount++;
    }
  }

  root.innerHTML = `<section class="codex"><header>CHALLENGE UPLINK <b>${escapeHtml(claimedCount)}/${escapeHtml(challenges.length)}</b></header><div class="codex__grid">${challenges
    .map(
      (challenge) =>
        `<article data-level="${progress[challenge.id]?.claimed ? "mastered" : "observed"}"><span>${escapeHtml(challenge.category)}</span><h3>${escapeHtml(challenge.name)}</h3><p>${escapeHtml(challenge.description)}</p><small>${Object.entries(
          challenge.reward,
        )
          .map(([key, value]) => `${escapeHtml(value)} ${escapeHtml(key)}`)
          .join(" · ")}</small></article>`,
    )
    .join("")}</div></section>`;
}

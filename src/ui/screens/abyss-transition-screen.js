export function renderAbyssTransition(root, { profile, onExtract, onDescend }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen abyss"><header>ARCHITECT TERMINATED <b>ABYSS ${profile.depth}</b></header><h2>THE SIGNAL CONTINUES BELOW.</h2><p>Gegner ×${profile.enemyMultiplier.toFixed(2)} · Eliten ×${profile.eliteMultiplier.toFixed(2)} · Korruption +${profile.corruptionGain}</p><button class="btn" data-descend>In den Abyss</button><button class="btn gold" data-extract>Sicher extrahieren</button></section>`;
  root.querySelector("[data-descend]").addEventListener("click", onDescend);
  root.querySelector("[data-extract]").addEventListener("click", onExtract);
}

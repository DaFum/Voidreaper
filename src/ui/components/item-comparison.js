export function renderItemComparison(container, current, candidate, inspect) {
  const before = current ? inspect(current) : { capacity: 0, reserved: 0, load: { ratio: 0, tier: "stable" }, expectedHeat: 0, startingCorruption: 0, tags: new Map() };
  const after = inspect(candidate);
  const row = (label, a, b, suffix = "") => `<span>${label}</span><b>${a}${suffix} → ${b}${suffix}</b>`;
  container.innerHTML = `<h3>${candidate.definition?.name ?? candidate.name}</h3><div class="comparison-grid">${row("Last", Math.round(before.load.ratio * 100), Math.round(after.load.ratio * 100), "%")}${row("Hitze", before.expectedHeat, after.expectedHeat)}${row("Korruption", before.startingCorruption, after.startingCorruption)}<span>Tags</span><b>${[...after.tags.keys()].join(" · ")}</b><span>Fehlerprofil</span><b>${candidate.definition?.faultProfileId ?? candidate.faultProfileId}</b></div>`;
}

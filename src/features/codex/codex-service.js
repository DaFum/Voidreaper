import { DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";

export function createCodexService(registries = {}) {
  const entries = Object.entries(registries).flatMap(([category, definitions]) => definitions.map(definition => ({ id: `${category}:${definition.id}`, contentId: definition.id, category, name: definition.name, description: definition.description ?? definition.reward ?? "Signal ohne lesbaren Text", tags: (definition.tags ?? []).map(tag => tag.id ?? tag), source: definition.unlockSource ?? category, forbidden: category === "forbidden" || definition.forbidden })));
  return {
    entries,
    discover(save, id, evidence = 1) { const current = save.codex[id] ?? { evidence: 0, level: "unknown" }; current.evidence += evidence; current.level = DISCOVERY_LEVELS[Math.min(3, Math.floor(current.evidence / 2))]; save.codex[id] = current; return current; },
    view(entry, state) { const level = state?.level ?? "unknown"; if (entry.forbidden && level === "unknown") return { ...entry, name: "VERBOTENE SIGNATUR", description: "[DATEN GESPERRT]", level }; return { ...entry, level, description: level === "unknown" ? "Unbekannte Signatur" : entry.description }; },
    filter(save, filters = {}) { return entries.map(entry => this.view(entry, save.codex[entry.id])).filter(entry => (!filters.category || entry.category === filters.category) && (!filters.status || entry.level === filters.status) && (!filters.source || entry.source === filters.source) && (!filters.tag || entry.tags.includes(filters.tag))); }
  };
}

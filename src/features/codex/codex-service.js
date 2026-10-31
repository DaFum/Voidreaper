import { DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";
import { CODEX_STRINGS } from "./codex-strings.js";

export function createCodexService(registries = {}) {
  const entries = Object.entries(registries).flatMap(
    ([category, definitions]) =>
      definitions.map((definition) => ({
        id: `${category}:${definition.id}`,
        contentId: definition.id,
        category,
        name: definition.name,
        description:
          definition.description ??
          definition.reward ??
          CODEX_STRINGS.FALLBACK_DESCRIPTION,
        tags: (definition.tags ?? []).map((tag) => tag.id ?? tag),
        source: definition.unlockSource ?? category,
        forbidden: category === "forbidden" || definition.forbidden,
      })),
  );
  return {
    entries,
    discover(save, id, evidence = 1) {
      const current = save.codex[id] ?? { evidence: 0, level: "unknown" };
      current.evidence += evidence;
      current.level =
        DISCOVERY_LEVELS[Math.min(3, Math.ceil(current.evidence / 2))];
      save.codex[id] = current;
      return current;
    },
    view(entry, state) {
      const level = state?.level ?? "unknown";
      if (entry.forbidden && level === "unknown")
        return {
          ...entry,
          name: CODEX_STRINGS.FORBIDDEN_NAME,
          description: CODEX_STRINGS.FORBIDDEN_DESCRIPTION,
          level,
        };
      return {
        ...entry,
        level,
        description:
          level === "unknown"
            ? CODEX_STRINGS.UNKNOWN_SIGNATURE
            : entry.description,
      };
    },
    filter(save, filters = {}) {
      // ⚡ Bolt: Avoid intermediate array allocations from .map().filter() chaining
      // by using a single-pass imperative loop to reduce GC pressure.
      const results = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = this.view(entries[i], save.codex[entries[i].id]);
        if (
          (!filters.category || entry.category === filters.category) &&
          (!filters.status || entry.level === filters.status) &&
          (!filters.source || entry.source === filters.source) &&
          (!filters.tag || entry.tags.includes(filters.tag))
        ) {
          results.push(entry);
        }
      }
      return results;
    },
  };
}

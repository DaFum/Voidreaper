export const UNLOCK_TYPES = Object.freeze(["research", "challenge", "blueprint", "secret", "starter"]);

export function unlockFlagsFromSave(save = {}) {
  const flags = { ...(save.unlocks ?? {}) };
  for (const definitionId of Object.keys(save.blueprints ?? {})) flags[definitionId] = true;
  return flags;
}

export function createUnlockService(flags = {}) {
  const unlocked = new Set(Object.keys(flags).filter(id => flags[id]));
  return {
    unlock(id, source) { if (!UNLOCK_TYPES.includes(source.type)) throw new Error(`Unknown unlock type: ${source.type}`); unlocked.add(id); return { id, source }; },
    // Re-sync from persisted save flags after another service (onboarding,
    // research) wrote unlocks directly to the save. Additive on purpose:
    // in-session unlocks granted via unlock() must survive a hydrate.
    hydrate(flags = {}) { for (const [id, value] of Object.entries(flags)) if (value) unlocked.add(id); },
    isUnlocked(definition) { return definition.unlockSource === "starter" || unlocked.has(definition.id); },
    hint(definition) {
      if (definition.unlockSource === "secret") return "Unbekannte Signatur. Weitere Analyse erforderlich.";
      if (definition.unlockSource === "blueprint") return "Blaupause in Anomalie- oder Bossknoten bergen.";
      if (definition.unlockSource === "challenge") return "Zugehörige Herausforderung abschließen.";
      return "Im Forschungsnetz freischalten.";
    },
    serialize() { return Object.fromEntries([...unlocked].map(id => [id, true])); }
  };
}

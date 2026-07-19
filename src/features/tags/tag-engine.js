function collectTags(sources) {
  const totals = new Map();
  const provenance = new Map();
  for (const source of sources) {
    for (const tag of source.tags ?? []) {
      const value = tag.value ?? 1;
      totals.set(tag.id, (totals.get(tag.id) ?? 0) + value);
      const entries = provenance.get(tag.id) ?? [];
      entries.push({ sourceId: source.id, value });
      provenance.set(tag.id, entries);
    }
  }
  return { totals, provenance };
}

const requirementValue = (tags, requirement) => tags.totals.get(requirement.id) ?? 0;

function resolveSynergies(tags, definitions, context = {}) {
  const active = [];
  const near = [];
  const blocked = [];
  for (const definition of definitions) {
    const requirements = definition.requirements ?? [];
    const missing = requirements.filter(requirement => requirementValue(tags, requirement) < (requirement.minimum ?? 1));
    const forbiddenBy = (definition.blockedBy ?? []).filter(tagId => (tags.totals.get(tagId) ?? 0) > 0);
    const contextBlocked = definition.minimumCorruption !== undefined && (context.corruption ?? 0) < definition.minimumCorruption
      || definition.minimumLoad !== undefined && (context.loadRatio ?? 0) < definition.minimumLoad;
    if (forbiddenBy.length || contextBlocked) {
      blocked.push({ ...definition, missing, forbiddenBy });
    } else if (!missing.length) {
      active.push(definition);
    } else if (missing.length === 1 && requirementValue(tags, missing[0]) >= (missing[0].minimum ?? 1) - 1) {
      near.push({ ...definition, missing });
    }
  }
  return { active, near, blocked };
}

export function createTagEngine(definitions, synergyDefinitions) {
  const knownTags = new Set(definitions.map(definition => definition.id));
  return {
    collect(sources) {
      const tags = collectTags(sources);
      for (const id of tags.totals.keys()) if (!knownTags.has(id)) console.warn(`Unknown tag: ${id}`);
      return tags;
    },
    resolve(tags, context) { return resolveSynergies(tags, synergyDefinitions, context); },
    delta(beforeSources, afterSources) {
      const before = collectTags(beforeSources).totals;
      const after = collectTags(afterSources).totals;
      const ids = new Set([...before.keys(), ...after.keys()]);
      return [...ids].map(id => ({ id, before: before.get(id) ?? 0, after: after.get(id) ?? 0 }))
        .filter(entry => entry.before !== entry.after);
    }
  };
}

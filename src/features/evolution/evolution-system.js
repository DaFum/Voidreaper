function meetsRequirement(requirement, context) {
  if (requirement.type === "tag")
    return (
      (context.tags.get(requirement.id) ?? 0) >= (requirement.minimum ?? 1)
    );
  if (requirement.type === "upgrade")
    return (
      (context.upgrades?.[requirement.id] ?? 0) >= (requirement.minimum ?? 1)
    );
  if (requirement.type === "corruption")
    return context.corruption >= requirement.minimum;
  if (requirement.type === "load")
    return context.loadRatio >= requirement.minimum;
  if (requirement.type === "item")
    return context.sources.some((source) => source.id === requirement.id);
  if (requirement.type === "event")
    return context.completedEvents?.has(requirement.id);
  return false;
}

export function createEvolutionSystem(
  definitions,
  { eventBus, confirmReplacement } = {},
) {
  const byId = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );
  return {
    evaluate(context) {
      // ⚡ Bolt: Avoid intermediate array allocations and closures from chained .map() and .every()
      // by using nested imperative loops and pre-allocated arrays in performance-critical paths.
      const results = new Array(definitions.length);
      for (let i = 0; i < definitions.length; i++) {
        const definition = definitions[i];
        const reqs = definition.requirements;
        const requirements = new Array(reqs.length);
        let allMet = true;

        for (let j = 0; j < reqs.length; j++) {
          const req = reqs[j];
          const met = meetsRequirement(req, context);
          requirements[j] = { ...req, met };
          if (!met) allMet = false;
        }

        const current = context.activeByWeapon?.get(definition.weaponFamily);
        results[i] = {
          definition,
          requirements,
          eligible: allMet && (!current || current === definition.id),
          blockedBy: current && current !== definition.id ? current : null,
        };
      }
      return results;
    },
    async activate(id, context) {
      const definition = byId.get(id);
      if (!definition) throw new Error(`Unknown evolution: ${id}`);
      const result = this.evaluate(context).find(
        (entry) => entry.definition.id === id,
      );
      const current = context.activeByWeapon.get(definition.weaponFamily);
      if (!result.requirements.every((requirement) => requirement.met))
        return false;
      if (current && current !== id) {
        const currentDefinition = byId.get(current);
        const requiresConfirmation =
          definition.permanentDownside || currentDefinition?.permanentDownside;
        if (
          requiresConfirmation &&
          !(await confirmReplacement?.({
            current: currentDefinition,
            next: definition,
          }))
        )
          return false;
      }
      context.activeByWeapon.set(definition.weaponFamily, id);
      eventBus?.emit("evolution-activated", {
        definition,
        replaced: current ?? null,
      });
      return true;
    },
    get(id) {
      return byId.get(id) ?? null;
    },
  };
}

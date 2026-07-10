function meetsRequirement(requirement, context) {
  if (requirement.type === "tag") return (context.tags.get(requirement.id) ?? 0) >= (requirement.minimum ?? 1);
  if (requirement.type === "upgrade") return (context.upgrades?.[requirement.id] ?? 0) >= (requirement.minimum ?? 1);
  if (requirement.type === "corruption") return context.corruption >= requirement.minimum;
  if (requirement.type === "load") return context.loadRatio >= requirement.minimum;
  if (requirement.type === "item") return context.sources.some(source => source.id === requirement.id);
  if (requirement.type === "event") return context.completedEvents?.has(requirement.id);
  return false;
}

export function createEvolutionSystem(definitions, { eventBus, confirmReplacement } = {}) {
  const byId = new Map(definitions.map(definition => [definition.id, definition]));
  return {
    evaluate(context) {
      return definitions.map(definition => {
        const requirements = definition.requirements.map(requirement => ({
          ...requirement,
          met: meetsRequirement(requirement, context)
        }));
        const current = context.activeByWeapon?.get(definition.weaponFamily);
        return {
          definition,
          requirements,
          eligible: requirements.every(requirement => requirement.met) && (!current || current === definition.id),
          blockedBy: current && current !== definition.id ? current : null
        };
      });
    },
    async activate(id, context) {
      const definition = byId.get(id);
      if (!definition) throw new Error(`Unknown evolution: ${id}`);
      const result = this.evaluate(context).find(entry => entry.definition.id === id);
      const current = context.activeByWeapon.get(definition.weaponFamily);
      if (!result.requirements.every(requirement => requirement.met)) return false;
      if (current && current !== id) {
        const currentDefinition = byId.get(current);
        const requiresConfirmation = definition.permanentDownside || currentDefinition?.permanentDownside;
        if (requiresConfirmation && !(await confirmReplacement?.({ current: currentDefinition, next: definition }))) return false;
      }
      context.activeByWeapon.set(definition.weaponFamily, id);
      eventBus?.emit("evolution-activated", { definition, replaced: current ?? null });
      return true;
    },
    get(id) { return byId.get(id) ?? null; }
  };
}

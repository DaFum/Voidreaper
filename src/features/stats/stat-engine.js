const MODIFIER_STAGE = Object.freeze({
  BASE: 10,
  SHIP: 20,
  REACTOR: 30,
  ITEM_FLAT: 40,
  ADDITIVE: 50,
  MULTIPLICATIVE: 60,
  CONDITIONAL: 70,
  OVERLOAD: 80,
  CORRUPTION: 90,
  CLAMP: 100,
  TEMPORARY: 110,
});

const stageValue = (modifier) =>
  modifier.stage ?? modifier.priority ?? MODIFIER_STAGE.ADDITIVE;

export function createStatEngine(
  definitions = [],
  sourceProvider = (context) => context.sources ?? [],
) {
  const definitionMap = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );
  return {
    register(definition) {
      if (definitionMap.has(definition.id))
        throw new Error(`Duplicate stat id: ${definition.id}`);
      definitionMap.set(definition.id, Object.freeze({ ...definition }));
    },
    calculate(statId, context = {}) {
      const definition = definitionMap.get(statId);
      if (!definition) return null;
      // ⚡ Bolt: Use a single-pass imperative for-loop instead of chained array methods
      // (.flatMap, .map, .filter) to minimize GC pressure and O(N) array allocations in the calculation hot path.
      const modifiers = [];
      for (const source of sourceProvider(context)) {
        if (!source.modifiers) continue;
        for (const modifier of source.modifiers) {
          if (
            modifier.targetStat === statId &&
            (!modifier.condition || modifier.condition(context))
          ) {
            modifiers.push({
              ...modifier,
              sourceId: modifier.sourceId ?? source.id,
            });
          }
        }
      }
      modifiers.sort((a, b) => stageValue(a) - stageValue(b));
      let value = definition.baseValue;
      const contributions = [];
      for (const modifier of modifiers) {
        const before = value;
        if (modifier.operation === "add") value += modifier.value;
        else if (modifier.operation === "multiply") value *= modifier.value;
        else if (modifier.operation === "override") value = modifier.value;
        else if (modifier.operation === "clamp")
          value = Math.max(
            modifier.value[0],
            Math.min(modifier.value[1], value),
          );
        contributions.push({
          sourceId: modifier.sourceId,
          operation: modifier.operation,
          value: modifier.value,
          before,
          after: value,
        });
      }
      value = Math.max(
        definition.minimum ?? -Infinity,
        Math.min(definition.maximum ?? Infinity, value),
      );
      if (definition.rounding === "integer") value = Math.round(value);
      return { value, baseValue: definition.baseValue, contributions };
    },
    definitions() {
      return [...definitionMap.values()];
    },
  };
}

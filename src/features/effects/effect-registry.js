export function createEffectRegistry() {
  const handlers = new Map();
  return {
    register(id, handler) {
      if (handlers.has(id)) throw new Error(`Duplicate effect id: ${id}`);
      handlers.set(id, handler);
    },
    execute(effect, context) {
      const handler = handlers.get(effect.id);
      if (!handler) {
        console.warn(`Unknown effect id: ${effect.id}`);
        return null;
      }
      try {
        return handler(effect, context);
      } catch (error) {
        console.error(`[effect:${effect.id}]`, error);
        return null;
      }
    },
    has(id) { return handlers.has(id); },
    ids() { return [...handlers.keys()]; }
  };
}

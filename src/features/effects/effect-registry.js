export function createEffectRegistry() {
  const handlers = new Map();
  // ids declared in content whose handlers are not implemented yet: executing
  // them is a quiet no-op, while a truly unknown id still warns loudly (typo).
  const latent = new Set();
  const latentLogged = new Set();
  return {
    register(id, handler) {
      if (handlers.has(id)) throw new Error(`Duplicate effect id: ${id}`);
      handlers.set(id, handler);
    },
    declareLatent(ids) {
      for (const id of ids) latent.add(id);
    },
    execute(effect, context) {
      if (!effect?.id) {
        console.warn("Attempted to execute an effect without an id");
        return null;
      }
      const handler = handlers.get(effect.id);
      if (!handler) {
        if (latent.has(effect.id)) {
          if (!latentLogged.has(effect.id)) {
            latentLogged.add(effect.id);
            console.debug(`Latent effect without handler: ${effect.id}`);
          }
          return null;
        }
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

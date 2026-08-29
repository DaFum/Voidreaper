export function createEquipmentService({ registry, inventory }) {
  const damageModifiers = new Map();
  // Performance optimization: Cache a Map index for inventory instances by instanceId
  // to avoid O(N) Array.find calls on every requireInstance call.
  let cachedInventoryRef = null;
  let instanceMap = null;

  const getInstanceMap = () => {
    const current = inventory() ?? [];
    if (cachedInventoryRef !== current || !instanceMap || instanceMap.size !== current.length) {
      cachedInventoryRef = current;
      instanceMap = new Map();
      for (let i = 0; i < current.length; i++) {
        const item = current[i];
        if (item && item.instanceId) {
          instanceMap.set(item.instanceId, item);
        }
      }
    }
    return instanceMap;
  };

  return {
    requireInstance(id) {
      let item = getInstanceMap().get(id);
      if (!item || item.instanceId !== id) {
        // Fallback in case inventory array was modified without changing reference or length
        cachedInventoryRef = null;
        item = getInstanceMap().get(id);
      }
      if (!item) throw new Error(`Unknown equipment instance: ${id}`);
      return item;
    },
    requireAssemblyProfile(id) {
      return registry.requireAssemblyProfile(id);
    },
    setDamageModifiers(instanceId, modifiers) {
      damageModifiers.set(instanceId, structuredClone(modifiers));
    },
    getModifiers(instanceId) {
      return structuredClone(damageModifiers.get(instanceId) ?? []);
    },
    isEnabled(instanceId) {
      return !(damageModifiers.get(instanceId) ?? []).some(
        (modifier) => modifier.stat === "enabled" && modifier.value === false,
      );
    },
  };
}

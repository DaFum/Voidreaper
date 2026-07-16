import { calculateLoad } from "../energy/energy-system.js";
import { EQUIPMENT_SLOT } from "./equipment-schema.js";

export const LOADOUT_SLOT_LAYOUT = Object.freeze({
  [EQUIPMENT_SLOT.SHIP]: 1,
  [EQUIPMENT_SLOT.PRIMARY_WEAPON]: 1,
  [EQUIPMENT_SLOT.REACTOR]: 1,
  [EQUIPMENT_SLOT.PASSIVE]: 4,
  [EQUIPMENT_SLOT.ACTIVE]: 2,
  [EQUIPMENT_SLOT.UTILITY]: 2,
  [EQUIPMENT_SLOT.RELIC]: 2
});

export function createEmptyLoadout({ secondRelicUnlocked = false } = {}) {
  return {
    slots: Object.fromEntries(Object.entries(LOADOUT_SLOT_LAYOUT).map(([slot, count]) => [slot, Array.from({ length: slot === EQUIPMENT_SLOT.RELIC && !secondRelicUnlocked ? 1 : count }, () => null)])),
    cosmeticProfile: null
  };
}

export const createLoadoutItem = (slot, index, definitionId) => ({
  instanceId: `loadout-${slot}-${index}-${definitionId}`,
  definitionId
});

export function createStarterLoadout() {
  const loadout = createEmptyLoadout();
  loadout.slots[EQUIPMENT_SLOT.SHIP][0] = { instanceId: "starter-vesper", definitionId: "vesper" };
  loadout.slots[EQUIPMENT_SLOT.PRIMARY_WEAPON][0] = { instanceId: "starter-railgun", definitionId: "railgun" };
  loadout.slots[EQUIPMENT_SLOT.REACTOR][0] = { instanceId: "starter-standard-core", definitionId: "standard-core" };
  return loadout;
}

export function resolvePrimaryLoadout(metaSave) {
  return metaSave?.loadouts?.primary?.slots ? metaSave.loadouts.primary : createStarterLoadout();
}

export function deriveEquipmentCatalogEntries(definitions, { isUnlocked = () => true, loadout = null } = {}) {
  const equippedById = new Map();
  for (const [slot, items] of Object.entries(loadout?.slots ?? {})) {
    items.forEach((item, index) => {
      if (!item?.definitionId) return;
      const slots = equippedById.get(item.definitionId) ?? [];
      slots.push({ slot, index });
      equippedById.set(item.definitionId, slots);
    });
  }
  return definitions.map(definition => {
    const equippedSlots = equippedById.get(definition.id) ?? [];
    const unlocked = isUnlocked(definition);
    const state = equippedSlots.length ? "equipped" : unlocked ? "available" : "locked";
    return { definition, state, equippedSlots, unlocked };
  });
}

export function createLoadoutService({ registry, tagEngine, unlocks }) {
  function sources(loadout) {
    return Object.values(loadout.slots).flat().filter(Boolean).map(item => ({
      ...registry.require(item.definitionId),
      instanceId: item.instanceId,
      item
    }));
  }

  return {
    equip(loadout, slot, index, item) {
      if (!loadout.slots[slot] || index < 0 || index >= loadout.slots[slot].length) throw new Error(`Unknown loadout slot: ${slot}[${index}]`);
      const definition = registry.require(item.definitionId);
      if (definition.slot !== slot) throw new Error(`${definition.id} cannot be equipped in ${slot}`);
      if (!unlocks.isUnlocked(definition)) throw new Error(`${definition.id} is not unlocked`);
      const currentlyEquipped = loadout.slots[slot][index];
      if (definition.unique && sources(loadout).some(source => source.id === definition.id && source.instanceId !== item.instanceId && source.instanceId !== currentlyEquipped?.instanceId)) {
        throw new Error(`Unique component already equipped: ${definition.id}`);
      }
      loadout.slots[slot][index] = item;
      return this.inspect(loadout);
    },
    unequip(loadout, slot, index) {
      const previous = loadout.slots[slot]?.[index] ?? null;
      if (loadout.slots[slot]) loadout.slots[slot][index] = null;
      return previous;
    },
    inspect(loadout) {
      const equipped = sources(loadout);
      let reactor = null;
      let ship = null;
      let reserved = 0;
      let expectedHeat = 0;
      let startingCorruption = 0;

      // V8 performance optimization: Using a single-pass for-loop instead of chained
      // .find() and .reduce() calls avoids allocating multiple closures and traversing
      // the array 5 separate times, minimizing GC overhead and execution time.
      for (let i = 0; i < equipped.length; i++) {
        const source = equipped[i];
        if (!reactor && source.slot === EQUIPMENT_SLOT.REACTOR) reactor = source;
        else if (!ship && source.slot === EQUIPMENT_SLOT.SHIP) ship = source;

        reserved += source.energyCost ?? 0;
        expectedHeat += source.heat ?? 0;
        startingCorruption += source.corruption ?? 0;
      }

      const capacity = (reactor?.energyCapacity ?? 0) + (ship?.energyCapacity ?? 0);

      return {
        sources: equipped,
        capacity,
        reserved,
        load: calculateLoad({ capacity, reserved }),
        tags: tagEngine.collect(equipped),
        expectedHeat,
        startingCorruption
      };
    },
    assemblyItems(loadout) { return sources(loadout).filter(source => source.item?.instanceId).map(source => ({ moduleInstanceId: source.item.instanceId, definitionId: source.id })); }
  };
}

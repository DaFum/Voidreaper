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
      const reactor = equipped.find(source => source.slot === EQUIPMENT_SLOT.REACTOR);
      const ship = equipped.find(source => source.slot === EQUIPMENT_SLOT.SHIP);
      const capacity = (reactor?.energyCapacity ?? 0) + (ship?.energyCapacity ?? 0);
      const reserved = equipped.reduce((sum, source) => sum + (source.energyCost ?? 0), 0);
      return {
        sources: equipped,
        capacity,
        reserved,
        load: calculateLoad({ capacity, reserved }),
        tags: tagEngine.collect(equipped),
        expectedHeat: equipped.reduce((sum, source) => sum + (source.heat ?? 0), 0),
        startingCorruption: equipped.reduce((sum, source) => sum + (source.corruption ?? 0), 0)
      };
    }
  };
}

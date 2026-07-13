import { createRegistry } from "../../core/registry.js";
import { assertDefinition } from "../../core/schema.js";
import { EQUIPMENT_REQUIRED_FIELDS } from "./equipment-schema.js";
import { resolveModuleAssemblyProfile } from "../ship-assembly/content/module-assembly-resolver.js";

export function createEquipmentRegistry() {
  const registry = createRegistry("equipment");
  return {
    ...registry,
    register(definition) {
      assertDefinition(definition, EQUIPMENT_REQUIRED_FIELDS, "equipment");
      if (!Array.isArray(definition.tags) || !Array.isArray(definition.effects)) {
        throw new Error(`Invalid equipment ${definition.id}: tags and effects must be arrays`);
      }
      return registry.register({ ...definition, assembly: resolveModuleAssemblyProfile(definition) });
    },
    bySlot(slot) { return registry.values().filter(definition => definition.slot === slot); },
    requireAssemblyProfile(id) { return registry.require(id).assembly; },
    getAssemblyProfile(id) { const definition = registry.get(id); return definition ? definition.assembly : null; }
  };
}

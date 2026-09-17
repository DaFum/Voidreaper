import { DAMAGE_BEHAVIORS } from "../../../content/ship-assembly/module-damage-behaviors.js";
function getDamageModifiers(node, visualProfileId) {
  if (node.damageState === "intact") return [];
  if (node.damageState === "armor-broken")
    return [
      {
        stat: "stability",
        operation: "add",
        value: -0.15,
        source: "assembly-damage",
      },
    ];
  if (node.damageState === "core-disrupted")
    return (
      DAMAGE_BEHAVIORS[visualProfileId] ?? DAMAGE_BEHAVIORS.default
    ).disruptedModifiers.map((modifier) => ({
      ...modifier,
      source: "assembly-damage",
    }));
  return [
    {
      stat: "enabled",
      operation: "override",
      value: false,
      source: "assembly-damage",
    },
  ];
}
export function createModuleFaultAdapter({
  assemblyService,
  equipmentService,
  eventBus,
}) {
  let attachedInstanceIds = new Set();
  const refresh = () => {
    const snapshot = assemblyService.getSnapshot();
    const currentInstanceIds = new Set();

    // ⚡ Bolt: Avoid intermediate arrays from Object.values(), .map(), and .filter()
    // by using a single-pass imperative loop to minimize GC pressure during assembly changes.
    for (const key in snapshot.nodesById) {
      if (Object.hasOwn(snapshot.nodesById, key)) {
        const node = snapshot.nodesById[key];
        if (node.moduleInstanceId) {
          currentInstanceIds.add(node.moduleInstanceId);
          equipmentService.setDamageModifiers(
            node.moduleInstanceId,
            getDamageModifiers(node, node.visualProfileId),
          );
        }
      }
    }

    for (const instanceId of attachedInstanceIds) {
      if (!currentInstanceIds.has(instanceId)) {
        equipmentService.setDamageModifiers(instanceId, []);
      }
    }

    attachedInstanceIds = currentInstanceIds;
  };
  const off = eventBus?.on("assembly:changed", refresh);
  return { refresh, destroy: () => off?.() };
}

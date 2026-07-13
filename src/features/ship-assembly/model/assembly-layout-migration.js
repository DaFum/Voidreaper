import { rotationForPortDirection } from "../geometry/port-world-transform.js";

const sameVector = (a, b) => a?.x === b?.x && a?.y === b?.y;

export function migrateAssemblyPortLayout(state, equipment) {
  if (!state?.rootNodeId) return false;
  let changed = false;
  for (const port of Object.values(state.portsById ?? {})) {
    let direction = port.direction;
    let localPosition;
    if (port.parentNodeId === state.rootNodeId) {
      localPosition = { x: (direction?.x ?? 0) * 72, y: (direction?.y ?? 0) * 72 };
    } else {
      const parent = state.nodesById?.[port.parentNodeId];
      const template = parent ? equipment.requireAssemblyProfile(parent.definitionId).childPorts?.find(item => item.key === port.key) : null;
      if (!template) continue;
      direction = template.direction;
      localPosition = template.localPosition;
    }
    if (!sameVector(port.direction, direction) || !sameVector(port.localPosition, localPosition)) {
      port.direction = { ...direction };
      port.localPosition = { ...localPosition };
      const child = state.nodesById?.[port.occupiedByNodeId];
      if (child) {
        child.localPosition = { ...localPosition };
        child.localRotation = rotationForPortDirection(direction);
      }
      changed = true;
    }
  }
  if (changed) state.structuralRevision = (state.structuralRevision ?? 0) + 1;
  return changed;
}

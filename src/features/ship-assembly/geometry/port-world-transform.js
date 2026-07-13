import { add, rotate } from "./vector-math.js";

export const rotationForPortDirection = (direction = { x: 0, y: 1 }) => Math.atan2(direction.y, direction.x) - Math.PI / 2;

export function resolvePortWorldTransform(port, geometrySnapshot) {
  const parent = geometrySnapshot?.nodes?.find(node => node.nodeId === port.parentNodeId);
  const localPosition = port.localPosition ?? { x: (port.direction?.x ?? 0) * 46, y: (port.direction?.y ?? 0) * 46 };
  const localDirection = port.direction ?? { x: 1, y: 0 };
  if (!parent) return { position: localPosition, direction: localDirection };
  return {
    position: add(parent.worldPosition, rotate(localPosition, parent.worldRotation ?? 0)),
    direction: rotate(localDirection, parent.worldRotation ?? 0)
  };
}

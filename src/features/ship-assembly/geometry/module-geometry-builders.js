const SIZE = Object.freeze({ S: 13, M: 18, L: 25, XL: 34 });
export function buildModuleGeometry(node, profile) {
  const size = SIZE[node.sizeClass ?? profile?.sizeClass] ?? 18;
  const length = size * (profile?.rendererId === "core-structural-spine" ? 2.25 : 1.45);
  return Object.freeze({ nodeId: node.nodeId, rendererId: profile?.rendererId ?? node.visualProfileId ?? "core-utility-cluster", size, length, variantSeed: node.variantSeed ?? 0, bounds: { ownerId: node.nodeId, minX: node.worldPosition.x-size, minY: node.worldPosition.y-size, maxX: node.worldPosition.x+size, maxY: node.worldPosition.y+size }, hitShape: { kind: "capsule", length, radius: size * .55 } });
}

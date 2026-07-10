const SIZE = Object.freeze({ S: 13, M: 18, L: 25, XL: 34 });
export function buildModuleGeometry(node, profile) {
  const size = SIZE[node.sizeClass ?? profile?.sizeClass] ?? 18;
  const length = size * (profile?.rendererId === "core-structural-spine" ? 2.25 : 1.45);
  const radius=size*.55,extent=length/2+radius;
  return Object.freeze({ nodeId: node.nodeId, rendererId: profile?.rendererId ?? node.visualProfileId ?? "core-utility-cluster", size, length, variantSeed: node.variantSeed ?? 0, bounds: { ownerId: node.nodeId, minX: node.worldPosition.x-extent, minY: node.worldPosition.y-extent, maxX: node.worldPosition.x+extent, maxY: node.worldPosition.y+extent }, hitShape: { kind: "capsule", length, radius } });
}

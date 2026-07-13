export const SIZE_RANK = Object.freeze({ S:1,M:2,L:3,XL:4 });
export const fitsSize = (moduleSize, portSize) => SIZE_RANK[moduleSize] <= SIZE_RANK[portSize];
export function overlapsAny(candidate, occupied, margin = 4) { return occupied.some(bounds => bounds.ownerId !== candidate.ownerId && !(candidate.maxX + margin < bounds.minX || candidate.minX - margin > bounds.maxX || candidate.maxY + margin < bounds.minY || candidate.minY - margin > bounds.maxY)); }
// Preview footprint must match the real module AABB or validated mounts overlap.
// Mirrors module-geometry-builders: extent = length/2 + radius = size*(1.45/2 + 0.55).
// The size table and factor are duplicated here (rather than imported) to avoid a
// placement<->geometry import cycle; keep them in sync with module-geometry-builders.
const MODULE_SIZE = Object.freeze({ S: 13, M: 18, L: 25, XL: 34 });
const EXTENT_FACTOR = 1.45 / 2 + 0.55;
export function boundsFromCenter(center, size, ownerId) { const half = (MODULE_SIZE[size] ?? MODULE_SIZE.M) * EXTENT_FACTOR; return { ownerId, minX:center.x-half,minY:center.y-half,maxX:center.x+half,maxY:center.y+half }; }

export const SIZE_RANK = Object.freeze({ S:1,M:2,L:3,XL:4 });
export const fitsSize = (moduleSize, portSize) => SIZE_RANK[moduleSize] <= SIZE_RANK[portSize];
export function overlapsAny(candidate, occupied, margin = 4) { return occupied.some(bounds => bounds.ownerId !== candidate.ownerId && !(candidate.maxX + margin < bounds.minX || candidate.minX - margin > bounds.maxX || candidate.maxY + margin < bounds.minY || candidate.minY - margin > bounds.maxY)); }
export function boundsFromCenter(center, size, ownerId) { const half = ({ S:12,M:18,L:26,XL:36 }[size] ?? 18); return { ownerId, minX:center.x-half,minY:center.y-half,maxX:center.x+half,maxY:center.y+half }; }

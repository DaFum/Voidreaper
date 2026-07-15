// `structuralKey` is a fresh object minted on every full structural rebuild and
// carried unchanged through damage-only updates. Renderers key the static base/
// armor bake cache on it so identity-based caches survive per-hit snapshots.
export function createGeometryCache(){return{revision:-1,structuralKey:null,shipFrameId:null,coreGeometry:null,shipStyle:null,nodeGeometry:new Map(),connectionGeometry:new Map(),armorGeometry:new Map(),decorators:[],occupiedBounds:[],totalBounds:null};}
export function calculateTotalBounds(bounds) {
  if (!bounds.length) return { minX: -48, minY: -48, maxX: 48, maxY: 48 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < bounds.length; i++) {
    const item = bounds[i];
    if (item.minX < minX) minX = item.minX;
    if (item.minY < minY) minY = item.minY;
    if (item.maxX > maxX) maxX = item.maxX;
    if (item.maxY > maxY) maxY = item.maxY;
  }
  return { minX, minY, maxX, maxY };
}

const BAKE_SCALE = 2;
const PADDING = 48;
const MAX_DIMENSION = 4096;
const layersBySnapshot = new WeakMap();

function unionBounds(snapshot) {
  const boxes = [snapshot.coreGeometry?.bounds, snapshot.totalBounds].filter(Boolean);
  if (!boxes.length) return null;
  return {
    minX: Math.min(...boxes.map(bounds => bounds.minX)),
    minY: Math.min(...boxes.map(bounds => bounds.minY)),
    maxX: Math.max(...boxes.map(bounds => bounds.maxX)),
    maxY: Math.max(...boxes.map(bounds => bounds.maxY))
  };
}

function bakeLayer(width, height, originX, originY, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * BAKE_SCALE);
  canvas.height = Math.ceil(height * BAKE_SCALE);
  const layerCtx = canvas.getContext("2d");
  if (!layerCtx) return null;
  layerCtx.setTransform(BAKE_SCALE, 0, 0, BAKE_SCALE, -originX * BAKE_SCALE, -originY * BAKE_SCALE);
  paint(layerCtx);
  return canvas;
}

export function getShipStaticLayers(snapshot, lod, painters) {
  if (typeof document === "undefined" || !snapshot) return null;
  if (layersBySnapshot.has(snapshot)) {
    const cached = layersBySnapshot.get(snapshot);
    if (cached === null || cached.lod === lod) return cached;
  }
  const bounds = unionBounds(snapshot);
  if (!bounds) return null;
  const x = bounds.minX - PADDING, y = bounds.minY - PADDING;
  const width = bounds.maxX - bounds.minX + PADDING * 2;
  const height = bounds.maxY - bounds.minY + PADDING * 2;
  if (width <= 0 || height <= 0 || width * BAKE_SCALE > MAX_DIMENSION || height * BAKE_SCALE > MAX_DIMENSION) {
    layersBySnapshot.set(snapshot, null);
    return null;
  }
  const base = bakeLayer(width, height, x, y, painters.base);
  const armor = bakeLayer(width, height, x, y, painters.armor);
  if (!base || !armor) {
    layersBySnapshot.set(snapshot, null);
    return null;
  }
  const entry = { lod, x, y, width, height, base, armor };
  layersBySnapshot.set(snapshot, entry);
  return entry;
}

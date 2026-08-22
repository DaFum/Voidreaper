const PI_2_x2 = Math.PI * 2;
const normalizeAngle = (value) => {
  let v = value % PI_2_x2;
  if (v < -Math.PI) v += PI_2_x2;
  if (v > Math.PI) v -= PI_2_x2;
  return Math.abs(v);
};
const rayIntersects = (origin, angle, bounds) => {
  const dx = Math.cos(angle),
    dy = Math.sin(angle);
  let near = 0,
    far = 220;
  for (const [axis, d] of [
    ["x", dx],
    ["y", dy],
  ]) {
    if (Math.abs(d) < 1e-6) {
      if (
        origin[axis] < bounds[`min${axis.toUpperCase()}`] ||
        origin[axis] > bounds[`max${axis.toUpperCase()}`]
      )
        return false;
      continue;
    }
    const a = (bounds[`min${axis.toUpperCase()}`] - origin[axis]) / d,
      b = (bounds[`max${axis.toUpperCase()}`] - origin[axis]) / d;
    near = Math.max(near, Math.min(a, b));
    far = Math.min(far, Math.max(a, b));
    if (near > far) return false;
  }
  return far > 12 && near < 220;
};
export function hasRequiredCoreExposure({ coreBounds, occupiedBounds }) {
  const center = coreBounds?.center ?? { x: 0, y: 0 };
  const open = [];

  for (let index = 0; index < 8; index++) {
    const angle = (index * Math.PI) / 4;
    let intersects = false;
    for (let i = 0; i < occupiedBounds.length; i++) {
      if (rayIntersects(center, angle, occupiedBounds[i])) {
        intersects = true;
        break;
      }
    }
    if (!intersects) {
      open.push(angle);
    }
  }

  for (let i = 0; i < open.length; i++) {
    for (let j = i + 1; j < open.length; j++) {
      if (normalizeAngle(open[i] - open[j]) >= Math.PI / 2) {
        return true;
      }
    }
  }
  return false;
}
export function createCoreExposureService() {
  return {
    accepts({ coreGeometry, occupiedBounds = [], candidate }) {
      const bounds = coreGeometry?.bounds,
        coreBounds = { ...bounds, center: { x: 0, y: 0 } };

      // ⚡ Bolt: avoid spread array allocation and filter array allocation
      let coreOwner = null;
      for (let i = 0; i < occupiedBounds.length; i++) {
        const item = occupiedBounds[i];
        if (
          item.minX === bounds?.minX &&
          item.minY === bounds?.minY &&
          item.maxX === bounds?.maxX &&
          item.maxY === bounds?.maxY
        ) {
          coreOwner = item;
          break;
        }
      }

      const newOccupied = [];
      for (let i = 0; i < occupiedBounds.length; i++) {
        const item = occupiedBounds[i];
        if (item !== coreOwner) {
          newOccupied.push(item);
        }
      }
      newOccupied.push(candidate);

      return hasRequiredCoreExposure({
        coreBounds,
        occupiedBounds: newOccupied,
      });
    },
    structuralAbsorption: (hitCount) => Math.max(0.25, 1 - hitCount * 0.18),
  };
}

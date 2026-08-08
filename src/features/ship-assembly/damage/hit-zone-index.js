// Conservative AABB half-extent: a capsule spans length/2 + radius along its
// axis (orientation is unknown here, so both axes use the full extent), a
// polygon spans its farthest vertex, circles/rings their (outer) radius.
const boundsFor = (zone) => {
  const p = zone.transform.position,
    shape = zone.shape,
    radius = shape.radius ?? shape.outerRadius ?? 0;

  let s = radius || 24;
  if (shape.length != null) {
    s = shape.length / 2 + radius;
  } else if (shape.points?.length) {
    // ⚡ Bolt: Replace map() and spread operator with manual loop
    // to avoid intermediate array allocation overhead and prevent
    // potential stack overflow on very large arrays.
    let max = 0;
    for (let i = 0; i < shape.points.length; i++) {
      const pt = shape.points[i];
      const ax = Math.abs(pt.x);
      const ay = Math.abs(pt.y);
      if (ax > max) max = ax;
      if (ay > max) max = ay;
    }
    s = max;
  }
  return { minX: p.x - s, minY: p.y - s, maxX: p.x + s, maxY: p.y + s };
};
export function createHitZoneIndex() {
  let revision = -1,
    zones = [];
  return {
    rebuild(nextRevision, nextZones) {
      if (revision === nextRevision) return false;
      revision = nextRevision;
      zones = nextZones.map((zone) => ({ zone, bounds: boundsFor(zone) }));
      return true;
    },
    query(bounds) {
      return zones
        .filter(
          (entry) =>
            !(
              entry.bounds.maxX < bounds.minX ||
              entry.bounds.minX > bounds.maxX ||
              entry.bounds.maxY < bounds.minY ||
              entry.bounds.minY > bounds.maxY
            ),
        )
        .map((entry) => entry.zone);
    },
    all: () => zones.map((entry) => entry.zone),
    get revision() {
      return revision;
    },
  };
}

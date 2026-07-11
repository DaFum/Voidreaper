export function createCollisionSystem({hitZoneIndex,damageRouter}) {
  // Reused across synchronous projectileHit calls to avoid per-call allocations in this hot path.
  const bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return {
    projectileHit({from,to,damage,penetration=0,damageType="kinetic",candidateResolver}) {
      bounds.minX = Math.min(from.x, to.x);
      bounds.minY = Math.min(from.y, to.y);
      bounds.maxX = Math.max(from.x, to.x);
      bounds.maxY = Math.max(from.y, to.y);

      const queriedZones = hitZoneIndex.query(bounds);
      const candidates = [];
      for (let i = 0; i < queriedZones.length; i++) {
        const resolved = candidateResolver(queriedZones[i], from, to);
        if (resolved) {
          candidates.push(resolved);
        }
      }

      return damageRouter.route({
        hit: {candidates, damageType},
        damage,
        penetration
      });
    },
    areaHit({bounds,totalDamage,cap,damageType}) {
      return damageRouter.routeArea({
        zones: hitZoneIndex.query(bounds),
        totalDamage,
        cap,
        damageType
      });
    }
  };
}

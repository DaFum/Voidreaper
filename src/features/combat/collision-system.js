export function createCollisionSystem({hitZoneIndex,damageRouter}) {
  return {
    projectileHit({from,to,damage,penetration=0,damageType="kinetic",candidateResolver}) {
      const bounds = {
        minX: Math.min(from.x, to.x),
        minY: Math.min(from.y, to.y),
        maxX: Math.max(from.x, to.x),
        maxY: Math.max(from.y, to.y)
      };

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

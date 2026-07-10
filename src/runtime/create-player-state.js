export function createPlayerState(base = {}) {
  return {
    x: base.x ?? 0,
    y: base.y ?? 0,
    vx: 0,
    vy: 0,
    radius: 14,
    hull: base.hull ?? 100,
    maxHull: base.maxHull ?? base.hull ?? 100,
    shield: base.shield ?? 0,
    tags: new Map(),
    stats: new Map(),
    resources: {
      energy: base.energy ?? 100,
      maxEnergy: base.maxEnergy ?? 100,
      heat: base.heat ?? 0,
      corruption: base.corruption ?? 0
    },
    activeModules: [null, null],
    loadout: null,
    statusEffects: new Map(),
    dodge: {
      cooldown: base.dodgeCooldown ?? 1.2,
      remaining: 0,
      duration: 0.18,
      activeRemaining: 0,
      invulnerability: 0.22,
      invulnerableRemaining: 0
    }
  };
}

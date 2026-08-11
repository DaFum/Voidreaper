// Unchanged from repo.
const profile = (id, family, options = {}) => Object.freeze({
  id,
  family,
  points: options.points ?? 6,
  core: options.core ?? "void",
  armor: options.armor ?? 1,
  fins: options.fins ?? 0,
  asymmetry: options.asymmetry ?? 0,
  muzzle: options.muzzle ?? false,
  orbit: options.orbit ?? false,
});

const ENEMY_VISUAL_PROFILES = Object.freeze({
  swarm: profile("swarm", "drone", { points: 4, armor: .35, fins: 2 }),
  chaser: profile("chaser", "lancer", { points: 3, armor: .7, fins: 2 }),
  orbiter: profile("orbiter", "orbiter", { points: 6, orbit: true, armor: .55 }),
  spitter: profile("spitter", "artillery", { points: 5, muzzle: true, armor: .65 }),
  tank: profile("tank", "bulwark", { points: 8, armor: 1.4, fins: 2 }),
  splitter: profile("splitter", "carrier", { points: 6, armor: .8, fins: 4 }),
  bomber: profile("bomber", "rammer", { points: 4, armor: .85, fins: 3 }),
  shield: profile("shield", "warden", { points: 6, armor: 1.25, orbit: true }),
  warper: profile("warper", "rift", { points: 7, core: "rift", armor: .45, asymmetry: .24 }),
  leech: profile("leech", "parasite", { points: 5, core: "organic", armor: .5, asymmetry: .18 }),
  boss: profile("boss", "architect", { points: 12, core: "architect", armor: 1.6, fins: 6, orbit: true }),
});

export const ENEMY_VISUAL_PROFILE_IDS = Object.freeze(Object.keys(ENEMY_VISUAL_PROFILES));
const warned = new Set();
const FALLBACK = profile("fallback", "unknown", { points: 4, core: "warning", armor: 1 });

export function resolveEnemyVisualProfile(type) {
  const resolved = ENEMY_VISUAL_PROFILES[type];
  if (!resolved && !warned.has(type)) {
    warned.add(type);
    console.warn(`[visuals] missing enemy profile: ${type}`);
  }
  return resolved ?? FALLBACK;
}

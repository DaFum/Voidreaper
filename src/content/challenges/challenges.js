const c = (id, category, name, description, predicate, reward) => ({ id, category, name, description, predicate, reward });
export const CHALLENGES = Object.freeze([
  c("rail-purity", "weapon", "Rail Purity", "Kampagne nur mit Railgun abschließen.", s => s.victory && s.weaponId === "railgun", { challengeSeals: 2 }),
  c("vesper-crown", "ship", "Vesper's Crown", "Architect mit Vesper besiegen.", s => s.bosses?.includes("eternal-architect") && s.shipId === "vesper", { bossCores: 1 }),
  c("architect-stable", "boss", "Stable Axiom", "Architect unter 50 Korruption besiegen.", s => s.bosses?.includes("eternal-architect") && s.corruption < 50, { challengeSeals: 3 }),
  c("choir-listener", "risk", "Choir Listener", "Vier Anomalien in einem Run annehmen.", s => s.anomaliesAccepted >= 4, { anomalyData: 5 }),
  c("three-safe", "extraction", "Three Safe", "Drei Prototypen extrahieren.", s => s.extracted >= 3, { salvageFragments: 15 }),
  c("overloaded", "build", "Beautiful Overload", "Mit mindestens 140% Last gewinnen.", s => s.victory && s.maximumLoad >= 1.4, { challengeSeals: 3 }),
  c("daily-clean", "daily", "Known Signal", "Daily ohne Schaden abschließen.", s => s.mode === "daily" && s.victory && s.damageTaken === 0, { voidShards: 25 }),
  c("abyss-five", "long-term", "Below Five", "Abyss-Tiefe 5 erreichen.", s => s.abyssDepth >= 5, { bossCores: 2 }),
  c("no-faults", "build", "Perfect Circuit", "Kampagne ohne Systemfehler gewinnen.", s => s.victory && s.faults === 0, { challengeSeals: 4 })
]);

export function createMasteryChallenges(ships, weapons) {
  return [...ships.map(item => ["ship", item]), ...weapons.map(item => ["weapon", item])].flatMap(([category, item]) => Array.from({ length: 5 }, (_, index) => ({ id: `mastery-${item.id}-${index + 1}`, category, name: `${item.name} Mastery ${index + 1}`, description: `${(index + 1) * 10} Sektoren mit ${item.name} abschließen.`, mastery: { contentId: item.id, tier: index + 1, target: (index + 1) * 10 }, reward: { challengeSeals: index + 1 } })));
}

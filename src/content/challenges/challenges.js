const c = ({ id, category, name, description, predicate, reward }) => ({
  id,
  category,
  name,
  description,
  predicate,
  reward,
});
export const CHALLENGES = Object.freeze([
  c({
    id: "rail-purity",
    category: "weapon",
    name: "Rail Purity",
    description: "Kampagne nur mit Railgun abschließen.",
    predicate: (s) => s.victory && s.weaponId === "railgun",
    reward: { challengeSeals: 2 },
  }),
  c({
    id: "vesper-crown",
    category: "ship",
    name: "Vesper's Crown",
    description: "Architect mit Vesper besiegen.",
    predicate: (s) =>
      s.bosses?.includes("eternal-architect") && s.shipId === "vesper",
    reward: { bossCores: 1 },
  }),
  c({
    id: "architect-stable",
    category: "boss",
    name: "Stable Axiom",
    description: "Architect unter 50 Korruption besiegen.",
    predicate: (s) =>
      s.bosses?.includes("eternal-architect") && s.corruption < 50,
    reward: { challengeSeals: 3 },
  }),
  c({
    id: "choir-listener",
    category: "risk",
    name: "Choir Listener",
    description: "Vier Anomalien in einem Run annehmen.",
    predicate: (s) => s.anomaliesAccepted >= 4,
    reward: { anomalyData: 5 },
  }),
  c({
    id: "three-safe",
    category: "extraction",
    name: "Three Safe",
    description: "Drei Prototypen extrahieren.",
    predicate: (s) => s.extracted >= 3,
    reward: { salvageFragments: 15 },
  }),
  c({
    id: "overloaded",
    category: "build",
    name: "Beautiful Overload",
    description: "Mit mindestens 140% Last gewinnen.",
    predicate: (s) => s.victory && s.maximumLoad >= 1.4,
    reward: { challengeSeals: 3 },
  }),
  c({
    id: "daily-clean",
    category: "daily",
    name: "Known Signal",
    description: "Daily ohne Schaden abschließen.",
    predicate: (s) => s.mode === "daily" && s.victory && s.damageTaken === 0,
    reward: { voidShards: 25 },
  }),
  c({
    id: "abyss-five",
    category: "long-term",
    name: "Below Five",
    description: "Abyss-Tiefe 5 erreichen.",
    predicate: (s) => s.abyssDepth >= 5,
    reward: { bossCores: 2 },
  }),
  c({
    id: "no-faults",
    category: "build",
    name: "Perfect Circuit",
    description: "Kampagne ohne Systemfehler gewinnen.",
    predicate: (s) => s.victory && s.faults === 0,
    reward: { challengeSeals: 4 },
  }),
]);

export function createMasteryChallenges(ships, weapons) {
  return [
    ...ships.map((item) => ["ship", item]),
    ...weapons.map((item) => ["weapon", item]),
  ].flatMap(([category, item]) =>
    Array.from({ length: 5 }, (_, index) => ({
      id: `mastery-${item.id}-${index + 1}`,
      category,
      name: `${item.name} Mastery ${index + 1}`,
      description: `${(index + 1) * 10} Sektoren mit ${item.name} abschließen.`,
      mastery: {
        contentId: item.id,
        tier: index + 1,
        target: (index + 1) * 10,
      },
      reward: { challengeSeals: index + 1 },
    })),
  );
}

export const scorePlacement = (m) =>
  m.functionalPosition * 2 +
  m.mountQuality * 1.5 +
  m.balance * 1.2 +
  m.energyPath +
  m.protection * 0.9 +
  m.fireLane * 1.4 +
  m.blueprintMatch * 1.6 -
  m.collisionRisk * 3 -
  m.branchPenalty * 1.1 -
  m.massAsymmetry;
export function explainPlacement(metrics, delta) {
  const reasons = [];
  if (metrics.fireLane > 0.7) reasons.push("Beste Waffenlinie");
  if (metrics.protection > 0.7) reasons.push("Gut geschützt");
  if (metrics.energyPath > 0.75) reasons.push("Kürzeste Energieleitung");
  if (metrics.balance > 0.7) reasons.push("Verbessert Balance");
  if (metrics.newPorts > 1)
    reasons.push(`Öffnet ${metrics.newPorts} Utility-Ports`);
  if (delta.rotationalInertia > 0.08) reasons.push("Erhöht Trägheit");
  if (metrics.protection < 0.35) reasons.push("Exponierte Außenposition");
  return reasons.slice(0, 4);
}

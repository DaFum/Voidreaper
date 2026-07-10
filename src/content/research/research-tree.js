const n = (id, branch, name, description, cost, prerequisites, unlocks, startBonus) => ({ id, branch, name, description, cost, prerequisites, unlocks, startBonus });
export const RESEARCH_TREE = Object.freeze([
  n("arsenal-rail", "arsenal", "Rail Lattice", "Öffnet Plasma Caster und einen kleinen Start-Schadensimpuls.", { voidShards: 20 }, [], ["plasma-caster"], { damage: .03 }),
  n("arsenal-ordnance", "arsenal", "Ordnance Archive", "Öffnet Raketen und Minen.", { voidShards: 35, bossCores: 1 }, ["arsenal-rail"], ["missile-battery", "mine-layer"]),
  n("arsenal-void", "arsenal", "Forbidden Arsenal", "Öffnet Anomaly Engine.", { anomalyData: 8 }, ["arsenal-ordnance"], ["anomaly-engine"]),
  n("engineering-load", "engineering", "Load Routing", "Zeigt Lastfolgen früher.", { voidShards: 15 }, [], ["load-preview"], { energy: 3 }),
  n("engineering-forge", "engineering", "Cold Forge Access", "Öffnet Affix-Sperre und Übertaktung.", { voidShards: 30 }, ["engineering-load"], ["workshop-lock", "workshop-overclock"]),
  n("engineering-furnace", "engineering", "Furnace Frame", "Öffnet Furnace.", { bossCores: 2 }, ["engineering-forge"], ["furnace"]),
  n("navigation-scan", "navigation", "Signal Triangulation", "Zeigt eine zusätzliche Knoteneigenschaft.", { voidShards: 15 }, [], ["map-scan-1"]),
  n("navigation-vector", "navigation", "Vector Charts", "Öffnet Vector und Karten-Reroll.", { voidShards: 30 }, ["navigation-scan"], ["vector", "map-reroll"]),
  n("navigation-paths", "navigation", "Deep Routes", "Öffnet alternative Kampagnenpfade.", { bossCores: 2 }, ["navigation-vector"], ["furnace-path", "grave-path"]),
  n("void-observation", "void-studies", "Choir Observation", "Anomalien liefern mehr Wissen.", { anomalyData: 3 }, [], ["codex-analyzed"]),
  n("void-reliquary", "void-studies", "Reliquary Protocol", "Öffnet Reliquary.", { anomalyData: 7 }, ["void-observation"], ["reliquary"]),
  n("void-null", "void-studies", "Null Concord", "Öffnet Null Path und Null Choir.", { anomalyData: 15, bossCores: 2 }, ["void-reliquary"], ["null-path", "null-choir"]),
  n("recovery-vault", "recovery", "Prototype Locker", "Vault-Kapazität +10.", { salvageFragments: 20 }, [], ["vault-30"]),
  n("recovery-wreck", "recovery", "Wreck Decoder", "Öffnet Bergungsmissionen.", { salvageFragments: 35 }, ["recovery-vault"], ["salvage-missions"]),
  n("recovery-master", "recovery", "Restoration Matrix", "Vault-Kapazität +20 und Affix-Extraktion.", { salvageFragments: 60 }, ["recovery-wreck"], ["vault-50", "affix-extraction"])
]);

export const MID_BOSSES = Object.freeze([
  { id: "shard-warden", name: "Shard Warden", regionId: "shattered-approach", check: "single-target", health: 1800, controlResistance: .2 },
  { id: "kiln-heart", name: "Kiln Heart", regionId: "furnace-expanse", check: "heat-management", health: 2400, controlResistance: .35 },
  { id: "grave-marshal", name: "Grave Marshal", regionId: "grave-circuit", check: "area-control", health: 3000, controlResistance: .45 },
  { id: "choir-prelate", name: "Choir Prelate", regionId: "null-cathedral", check: "corruption", health: 3600, controlResistance: .55 },
  { id: "axiom-proxy", name: "Axiom Proxy", regionId: "architects-crown", check: "load-stability", health: 4300, controlResistance: .65 }
].map(boss => ({ ...boss, reward: ["evolution-catalyst", "reactor"] })));

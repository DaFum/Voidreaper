export const NODE_TYPES = Object.freeze({
  combat: { label: "Gefecht", icon: "◇", reward: "Scrap + Modul", corruption: 2 },
  elite: { label: "Elite-Signal", icon: "◆", reward: "Flux + seltenes Modul", corruption: 5 },
  salvage: { label: "Bergung", icon: "▱", reward: "Prototyp-Chance", corruption: 1 },
  merchant: { label: "Händler", icon: "◫", reward: "Handelszugang", corruption: 0 },
  workshop: { label: "Werkstatt", icon: "⌁", reward: "Build-Umbau", corruption: -2 },
  anomaly: { label: "Anomalie", icon: "◉", reward: "Unbekannt", corruption: 8, hidden: true },
  recovery: { label: "Recovery", icon: "+", reward: "Reparatur", corruption: -5 },
  "mid-boss": { label: "Zwischenboss", icon: "⬡", reward: "Katalysator / Reaktor", corruption: 10 },
  extraction: { label: "Extraktion", icon: "⇡", reward: "Prototyp sichern", corruption: 0 },
  boss: { label: "Eternal Architect", icon: "⬢", reward: "Kampagnenabschluss", corruption: 15 }
});

export function normalizeNodeType(type) {
  return NODE_TYPES[type] ? type : "combat";
}

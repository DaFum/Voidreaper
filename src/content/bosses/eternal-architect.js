export const ETERNAL_ARCHITECT = Object.freeze({
  id: "eternal-architect", name: "Eternal Architect", health: 18000,
  phases: [
    { threshold: .75, rule: "segmented-arena", telegraph: "Sektoren vor dem Kollaps cyan markieren" },
    { threshold: .5, rule: "mirror-dominant-tags", telegraph: "Kopierte Tags über Boss anzeigen" },
    { threshold: .25, rule: "load-corruption-attacks", telegraph: "Last- und Korruptionsfarbe kündigt Angriff an" },
    { threshold: 0, rule: "final-choice", telegraph: "Stabilisieren oder maximal überladen" }
  ],
  damageWindows: ["Projectile", "Plasma", "Explosive", "Summon", "Arc", "Beam", "Mine", "Orbit", "Corrosion", "Anomaly"]
});

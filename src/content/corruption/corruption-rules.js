export const CORRUPTION_THRESHOLDS = Object.freeze([
  { id: "stable", value: 0, benefit: null, risk: null },
  { id: "tainted", value: 25, benefit: "Korrumpierte Affixe können erscheinen", risk: "Leichter Fehlerdruck" },
  { id: "breach", value: 50, benefit: "Verbotene Angebote verfügbar", risk: "Stärkere Gegner" },
  { id: "transformed", value: 75, benefit: "Schwere Transformationen", risk: "Elite-Modifikatoren eskalieren" },
  { id: "abyssal", value: 100, benefit: "Abyss-Signatur aktiv", risk: "Permanenter Run-Mutator" }
]);

export const CORRUPTION_SIGNATURES = Object.freeze({
  tainted: "SIG // MINOR STATIC",
  breach: "SIG // CHOIR ANSWERS",
  transformed: "SIG // FORM UNBOUND",
  abyssal: "SIG // BEYOND ZERO"
});

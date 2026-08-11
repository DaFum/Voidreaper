// Refined + expanded Forged Abyss palette.
// Same mood; adds tonal steps so renderers can do real top-lit shading,
// panel-line grooves and rim highlights. All original keys are preserved,
// so existing overrides (shipStyle.palette) keep working.
const FORGED_ABYSS_PALETTE = Object.freeze({
  // hull tones (dark -> light), used for directional sheen fills
  hullDeep: "#05090f",
  hull: "#0b131c",
  hullLight: "#16232e",
  metal: "#182a36",
  metalLight: "#2c4655",
  structure: "#22343f",
  plate: "#33505f",
  plateLight: "#527585",
  // armor
  armor: "#5f8496",
  armorLight: "#94bfce",
  // grooves + rims
  panelLine: "#070f16",
  edge: "#c7f9ff",
  rim: "#e9ffff",
  // energy
  energy: "#4fead0",
  energySoft: "#9ff6e6",
  glow: "#7ff0ff",
  // void / corruption
  void: "#4a155f",
  voidBright: "#7b2e97",
  fault: "#e07bff",
  // states
  damage: "#ff5470",
  cockpit: "#f2fdff",
  thruster: "#ffb04a",
  thrusterCore: "#fff2c2",
});

export const REGION_VISUAL_PALETTES = Object.freeze({
  "shattered-approach": Object.freeze({ floor: "#0a0d18", grid: "#49417a", accent: "#8c7cff", void: "#30104a" }),
  "furnace-expanse": Object.freeze({ floor: "#160806", grid: "#713420", accent: "#ff8a42", void: "#4d101c" }),
  "grave-circuit": Object.freeze({ floor: "#061113", grid: "#31585a", accent: "#67d8c3", void: "#173b3a" }),
  "null-cathedral": Object.freeze({ floor: "#100515", grid: "#64306f", accent: "#dd63ff", void: "#390c4a" }),
  "architects-crown": Object.freeze({ floor: "#071018", grid: "#326679", accent: "#9df6e4", void: "#182a56" }),
});

export function mergeVisualPalette(overrides = {}) {
  return { ...FORGED_ABYSS_PALETTE, ...overrides };
}

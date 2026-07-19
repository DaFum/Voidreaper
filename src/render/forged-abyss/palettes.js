const FORGED_ABYSS_PALETTE = Object.freeze({
  hull: "#0b131c",
  metal: "#182a36",
  structure: "#20323d",
  armor: "#557584",
  edge: "#b9f7ff",
  energy: "#48e5c2",
  void: "#4a155f",
  fault: "#dd63ff",
  damage: "#ff4d6d",
  cockpit: "#eefcff",
  thruster: "#ffad42"
});

export const REGION_VISUAL_PALETTES = Object.freeze({
  "shattered-approach": Object.freeze({ floor: "#0a0d18", grid: "#49417a", accent: "#8c7cff", void: "#30104a" }),
  "furnace-expanse": Object.freeze({ floor: "#160806", grid: "#713420", accent: "#ff8a42", void: "#4d101c" }),
  "grave-circuit": Object.freeze({ floor: "#061113", grid: "#31585a", accent: "#67d8c3", void: "#173b3a" }),
  "null-cathedral": Object.freeze({ floor: "#100515", grid: "#64306f", accent: "#dd63ff", void: "#390c4a" }),
  "architects-crown": Object.freeze({ floor: "#071018", grid: "#326679", accent: "#9df6e4", void: "#182a56" })
});

export function mergeVisualPalette(overrides = {}) {
  return { ...FORGED_ABYSS_PALETTE, ...overrides };
}

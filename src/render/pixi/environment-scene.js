// Pure, deterministic scene-spec builders for the GPU environment stage.
// No pixi.js import here: this module is testable headless (node:test) and
// keeps the "renderer consumes precomputed specs" contract of src/render/.
import { mulberry32, hashString } from "../../core/rng.js";
import { REGION_VISUAL_PALETTES } from "../forged-abyss/palettes.js";

const TAU = Math.PI * 2;

export const DEFAULT_ENVIRONMENT_THEME_ID = "deep-void";

// Sky/nebula/star tints per region. Keys mirror REGION_VISUAL_PALETTES so a
// region always finds a matching atmosphere; "deep-void" backs the menu and
// any unknown region id.
export const ENVIRONMENT_THEMES = Object.freeze({
  "deep-void": Object.freeze({
    sky: Object.freeze(["#070212", "#04010a", "#060113"]),
    nebula: Object.freeze(["#4318b8", "#c77dff", "#ff2d78", "#4cc9f0", "#06ffa5"]),
    stars: Object.freeze(["#efeaf7", "#c77dff", "#4cc9f0", "#8b30e8", "#ffd166"]),
    dust: "#8c7cff",
    glow: "#4318b8"
  }),
  "shattered-approach": Object.freeze({
    sky: Object.freeze(["#080316", "#04010a", "#0a0d18"]),
    nebula: Object.freeze(["#4318b8", "#8c7cff", "#c77dff", "#30104a", "#4cc9f0"]),
    stars: Object.freeze(["#efeaf7", "#c9bfff", "#8c7cff", "#4cc9f0", "#ffffff"]),
    dust: "#8c7cff",
    glow: "#49417a"
  }),
  "furnace-expanse": Object.freeze({
    sky: Object.freeze(["#120407", "#080103", "#160806"]),
    nebula: Object.freeze(["#ff8a42", "#dd3f2e", "#4d101c", "#ffb347", "#713420"]),
    stars: Object.freeze(["#ffe8d1", "#ffb347", "#ff8a42", "#f3d9c8", "#ffffff"]),
    dust: "#ff8a42",
    glow: "#713420"
  }),
  "grave-circuit": Object.freeze({
    sky: Object.freeze(["#03100f", "#020807", "#061113"]),
    nebula: Object.freeze(["#67d8c3", "#31585a", "#173b3a", "#3ba694", "#0c6b60"]),
    stars: Object.freeze(["#defcf5", "#67d8c3", "#9df6e4", "#b5d8d1", "#ffffff"]),
    dust: "#67d8c3",
    glow: "#31585a"
  }),
  "null-cathedral": Object.freeze({
    sky: Object.freeze(["#0d0313", "#060109", "#100515"]),
    nebula: Object.freeze(["#dd63ff", "#64306f", "#390c4a", "#8b30e8", "#ff2d78"]),
    stars: Object.freeze(["#f6e3ff", "#dd63ff", "#c77dff", "#e0c4ee", "#ffffff"]),
    dust: "#dd63ff",
    glow: "#64306f"
  }),
  "architects-crown": Object.freeze({
    sky: Object.freeze(["#040b14", "#02060c", "#071018"]),
    nebula: Object.freeze(["#9df6e4", "#326679", "#182a56", "#48e5c2", "#4cc9f0"]),
    stars: Object.freeze(["#eafffa", "#9df6e4", "#4cc9f0", "#b8d7e8", "#ffffff"]),
    dust: "#9df6e4",
    glow: "#326679"
  })
});

export function resolveEnvironmentTheme(regionId) {
  return ENVIRONMENT_THEMES[regionId] ?? ENVIRONMENT_THEMES[DEFAULT_ENVIRONMENT_THEME_ID];
}

export function environmentThemeIdFor(regionId) {
  return ENVIRONMENT_THEMES[regionId] ? regionId : DEFAULT_ENVIRONMENT_THEME_ID;
}

// Every region palette must have an atmosphere theme, otherwise a new region
// would silently fall back — surfaced by tests/render/pixi-environment.test.js.
export function missingRegionThemes() {
  return Object.keys(REGION_VISUAL_PALETTES).filter(regionId => !ENVIRONMENT_THEMES[regionId]);
}

/**
 * Star specs live in an abstract unit square [0,1)² that the stage maps onto a
 * wrapping screen-space field. `band` 0..2 selects depth (far → near).
 */
export function createStarSpecs({ seed = 7, count = 450 } = {}) {
  const rng = mulberry32(hashString(`stars:${seed}`));
  const stars = [];
  for (let index = 0; index < count; index++) {
    const band = index % 3;
    const depth = 0.2 + band * 0.28 + rng() * 0.16; // 0.2..0.92
    stars.push({
      x: rng(),
      y: rng(),
      depth,
      size: (0.5 + rng() * 1.6) * (0.6 + depth),
      colorIndex: (rng() * 5) | 0,
      twinklePhase: rng() * TAU,
      twinkleSpeed: 0.5 + rng() * 2.6,
      glow: rng() < 0.14 // a few stars get a soft halo sprite
    });
  }
  return stars;
}

/**
 * Nebula blobs for one tiling texture, in texture-space pixels. Blobs near an
 * edge are meant to be re-stamped wrapped by the baker so the tile is seamless.
 */
export function createNebulaBlobSpecs({ seed = 7, colors, textureSize = 1024, blobCount = 26 } = {}) {
  const rng = mulberry32(hashString(`nebula:${seed}`));
  const blobs = [];
  for (let index = 0; index < blobCount; index++) {
    blobs.push({
      x: rng() * textureSize,
      y: rng() * textureSize,
      radius: textureSize * (0.09 + rng() * 0.22),
      colorIndex: (rng() * colors.length) | 0,
      alpha: 0.05 + rng() * 0.08
    });
  }
  return blobs;
}

/** Drifting foreground dust motes, unit-square space like stars. */
export function createDustSpecs({ seed = 7, count = 70 } = {}) {
  const rng = mulberry32(hashString(`dust:${seed}`));
  const motes = [];
  for (let index = 0; index < count; index++) {
    motes.push({
      x: rng(),
      y: rng(),
      size: 1.5 + rng() * 3.5,
      driftX: (rng() - 0.5) * 14,
      driftY: (rng() - 0.5) * 10,
      alpha: 0.08 + rng() * 0.2,
      pulsePhase: rng() * TAU,
      pulseSpeed: 0.3 + rng() * 0.9
    });
  }
  return motes;
}

/** Occasional shooting-star streaks; fully time-driven so rendering stays deterministic. */
export function createStreakSpecs({ seed = 7, count = 3 } = {}) {
  const rng = mulberry32(hashString(`streaks:${seed}`));
  const streaks = [];
  for (let index = 0; index < count; index++) {
    streaks.push({
      period: 9 + rng() * 13,       // seconds between passes
      offset: rng() * 20,           // phase offset in seconds
      duration: 0.7 + rng() * 0.5,  // visible time per pass
      y: 0.08 + rng() * 0.6,        // vertical lane (fraction of height)
      slope: 0.15 + rng() * 0.3,
      length: 120 + rng() * 160,
      fromLeft: rng() < 0.5
    });
  }
  return streaks;
}

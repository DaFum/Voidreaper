// Pure helpers for the GPU combat-FX stage (no pixi.js import — testable
// headless, mirrors the legacy 2D particle math exactly).

const tintCache = new Map();

/** Hex CSS color → Pixi tint int; anything non-hex falls back to white. */
export function parseTint(color) {
  if (typeof color !== "string" || color[0] !== "#") return 0xffffff;
  const cached = tintCache.get(color);
  if (cached !== undefined) return cached;
  let hex = color.slice(1);
  if (hex.length === 3) hex = hex.split("").map(char => char + char).join("");
  const value = Number.parseInt(hex.slice(0, 6), 16);
  const tint = Number.isNaN(value) ? 0xffffff : value;
  tintCache.set(color, tint);
  return tint;
}

// Legacy draws particles above this squared speed as velocity-stretched sparks.
export const SPARK_SPEED_SQ = 2400;

export function isSpark(particle) {
  return particle.vx * particle.vx + particle.vy * particle.vy > SPARK_SPEED_SQ;
}

/** Length/rotation of a spark streak — matches the legacy 0.035s velocity tail. */
export function sparkTransform(particle) {
  return {
    length: Math.sqrt((particle.vx)*(particle.vx) + (particle.vy)*(particle.vy)) * 0.035,
    rotation: Math.atan2(particle.vy, particle.vx)
  };
}

/** Shockwave radius easing (cubic ease-out), identical to the legacy ring. */
export function shockEase(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

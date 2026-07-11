// GPU environment stage: sky gradient, layered nebula, twinkling parallax
// starfield, drifting dust and shooting-star streaks rendered with PixiJS
// (WebGL/WebGPU) on a dedicated canvas *below* the legacy #game canvas.
//
// The stage never touches game state: legacy-runtime calls render(frame) once
// per drawn frame via configureEnvironmentRenderer and keeps its old canvas
// backdrop as fallback when this module fails to initialise (no WebGL).
import { Application, Container, Sprite, Texture, TilingSprite } from "pixi.js";
import {
  createDustSpecs,
  createNebulaBlobSpecs,
  createStarSpecs,
  createStreakSpecs,
  environmentThemeIdFor,
  resolveEnvironmentTheme
} from "./environment-scene.js";

const TAU = Math.PI * 2;
const FIELD = 4096; // virtual star-field size before screen wrapping
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const hexToInt = hex => parseInt(hex.slice(1), 16);

function bakeSkyTexture(colors) {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.6, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  // skipCache: baked per theme change, must not pile up in the global cache
  return Texture.from(canvas, true);
}

function bakeNebulaTexture({ seed, colors, size = 1024 }) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const blobs = createNebulaBlobSpecs({ seed, colors, textureSize: size });
  // stamp every blob at all nine wrap offsets so the tile is seamless
  for (const blob of blobs) {
    const color = colors[blob.colorIndex % colors.length];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = blob.x + dx * size, y = blob.y + dy * size;
        if (x + blob.radius < 0 || x - blob.radius > size || y + blob.radius < 0 || y - blob.radius > size) continue;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.radius);
        gradient.addColorStop(0, `${color}${Math.round(blob.alpha * 255).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, blob.radius, 0, TAU);
        ctx.fill();
      }
    }
  }
  // skipCache: baked per theme change, must not pile up in the global cache
  return Texture.from(canvas, true);
}

function bakeGlowTexture(size, hardness = 0.12) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(hardness, "rgba(255,255,255,.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas, true);
}

function bakeStreakTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 128, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.75, "rgba(255,255,255,.7)");
  gradient.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 4);
  return Texture.from(canvas, true);
}

export async function createEnvironmentStage({ canvas, seed = 7, reducedMotion = false } = {}) {
  const app = new Application();
  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: clamp(window.devicePixelRatio || 1, 1, 2.5),
    autoDensity: true,
    antialias: true,
    backgroundAlpha: 1,
    background: 0x04010a,
    autoStart: false,
    sharedTicker: false
  });

  let width = window.innerWidth;
  let height = window.innerHeight;
  let themeId = null;
  let destroyed = false;

  // --- static textures -----------------------------------------------------
  const starCoreTexture = bakeGlowTexture(16, 0.45);
  const starHaloTexture = bakeGlowTexture(48);
  const dustTexture = bakeGlowTexture(24);
  const streakTexture = bakeStreakTexture();

  // --- layers (back to front) ----------------------------------------------
  const sky = new Sprite();
  const nebulaFar = new TilingSprite({ texture: Texture.EMPTY, width, height });
  nebulaFar.alpha = 0.95;
  const nebulaNear = new TilingSprite({ texture: Texture.EMPTY, width, height });
  nebulaNear.alpha = 0.55;
  nebulaNear.blendMode = "add";
  nebulaNear.tileScale.set(1.6, 1.6);

  const shakeLayer = new Container();
  const starLayer = new Container();
  const dustLayer = new Container();
  dustLayer.blendMode = "add";
  const streakLayer = new Container();
  shakeLayer.addChild(starLayer, dustLayer, streakLayer);
  app.stage.addChild(sky, nebulaFar, nebulaNear, shakeLayer);

  const starSpecs = createStarSpecs({ seed });
  const stars = starSpecs.map(spec => {
    const sprite = new Sprite(spec.glow ? starHaloTexture : starCoreTexture);
    sprite.anchor.set(0.5);
    sprite.scale.set((spec.glow ? 0.28 : 0.13) * spec.size);
    sprite.blendMode = "add";
    starLayer.addChild(sprite);
    return { spec, sprite };
  });

  const dustSpecs = createDustSpecs({ seed });
  const dust = dustSpecs.map(spec => {
    const sprite = new Sprite(dustTexture);
    sprite.anchor.set(0.5);
    sprite.scale.set(spec.size / 34);
    dustLayer.addChild(sprite);
    return { spec, sprite };
  });

  const streakSpecs = createStreakSpecs({ seed });
  const streaks = streakSpecs.map(spec => {
    const sprite = new Sprite(streakTexture);
    sprite.anchor.set(1, 0.5);
    sprite.scale.set(spec.length / 128, 1);
    sprite.blendMode = "add";
    sprite.visible = false;
    streakLayer.addChild(sprite);
    return { spec, sprite };
  });

  // --- theming ---------------------------------------------------------------
  const swapTexture = (target, texture) => {
    const previous = target.texture;
    target.texture = texture;
    if (previous && previous !== Texture.EMPTY) previous.destroy(true);
  };
  const applyTheme = regionId => {
    const nextId = environmentThemeIdFor(regionId);
    if (nextId === themeId) return;
    themeId = nextId;
    const theme = resolveEnvironmentTheme(nextId);
    swapTexture(sky, bakeSkyTexture(theme.sky));
    swapTexture(nebulaFar, bakeNebulaTexture({ seed: `${seed}:${nextId}:far`, colors: theme.nebula }));
    swapTexture(nebulaNear, bakeNebulaTexture({ seed: `${seed}:${nextId}:near`, colors: theme.nebula }));
    for (const { spec, sprite } of stars) sprite.tint = hexToInt(theme.stars[spec.colorIndex % theme.stars.length]);
    const dustTint = hexToInt(theme.dust);
    for (const { sprite } of dust) sprite.tint = dustTint;
    resizeSky();
  };

  // --- sizing ----------------------------------------------------------------
  const resizeSky = () => {
    sky.width = width;
    sky.height = height;
  };
  const resize = () => {
    if (destroyed) return;
    width = window.innerWidth;
    height = window.innerHeight;
    app.renderer.resolution = clamp(window.devicePixelRatio || 1, 1, 2.5);
    app.renderer.resize(width, height);
    nebulaFar.width = width; nebulaFar.height = height;
    nebulaNear.width = width; nebulaNear.height = height;
    resizeSky();
  };
  window.addEventListener("resize", resize, { passive: true });

  // wrap a virtual field coordinate onto the screen with a hidden margin
  const wrap = (value, span, margin) => {
    const total = span + margin * 2;
    return ((value % total) + total) % total - margin;
  };

  // --- per-frame update --------------------------------------------------------
  const render = frame => {
    if (destroyed) return false;
    const { time = 0, camX = 0, camY = 0, shakeX = 0, shakeY = 0, regionId, lowDetail = false } = frame ?? {};
    applyTheme(regionId);
    shakeLayer.position.set(shakeX * 0.6, shakeY * 0.6);

    const drift = reducedMotion ? 0 : time * 3;
    nebulaFar.tilePosition.set(-camX * 0.12 + drift, -camY * 0.12 + drift * 0.6);
    nebulaNear.tilePosition.set(-camX * 0.22 - drift * 0.8, -camY * 0.22 - drift * 0.5);

    for (const { spec, sprite } of stars) {
      const parallax = 0.15 + spec.depth * 0.6;
      sprite.x = wrap(spec.x * FIELD - camX * parallax, width, 48);
      sprite.y = wrap(spec.y * FIELD - camY * parallax, height, 48);
      const twinkle = reducedMotion ? 0.85 : 0.55 + Math.sin(time * spec.twinkleSpeed + spec.twinklePhase) * 0.45;
      sprite.alpha = (0.25 + spec.depth * 0.6) * twinkle;
    }

    dustLayer.visible = !lowDetail;
    if (!lowDetail) {
      for (const { spec, sprite } of dust) {
        sprite.x = wrap(spec.x * FIELD - camX * 0.45 + spec.driftX * time, width, 32);
        sprite.y = wrap(spec.y * FIELD - camY * 0.45 + spec.driftY * time, height, 32);
        sprite.alpha = spec.alpha * (reducedMotion ? 1 : 0.6 + Math.sin(time * spec.pulseSpeed + spec.pulsePhase) * 0.4);
      }
    }

    streakLayer.visible = !reducedMotion && !lowDetail;
    if (streakLayer.visible) {
      for (const { spec, sprite } of streaks) {
        const phase = ((time + spec.offset) % spec.period + spec.period) % spec.period;
        if (phase >= spec.duration) { sprite.visible = false; continue; }
        const progress = phase / spec.duration;
        const startX = spec.fromLeft ? -spec.length : width + spec.length;
        const endX = spec.fromLeft ? width + spec.length : -spec.length;
        const deltaX = endX - startX;
        const deltaY = spec.slope * height;
        sprite.visible = true;
        sprite.x = startX + deltaX * progress;
        sprite.y = spec.y * height + deltaY * (progress - 0.5);
        sprite.rotation = Math.atan2(deltaY, deltaX);
        sprite.alpha = Math.sin(progress * Math.PI) * 0.9;
      }
    }

    app.renderer.render(app.stage);
    return true;
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("resize", resize);
    // v8 signature: destroy(rendererDestroyOptions, stageDestroyOptions)
    app.destroy({ removeView: false }, { children: true, texture: true, textureSource: true });
  };

  applyTheme(null);
  resize();
  return { render, resize, destroy, get themeId() { return themeId; } };
}

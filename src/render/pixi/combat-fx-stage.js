// GPU combat-FX stage: additive particles, shockwave rings and the bloom
// post-pass rendered with PixiJS on a transparent overlay canvas *above*
// #game (below HUD/CRT overlays).
//
// Contract with legacy-runtime (configureCombatFxRenderer):
// - capture(frame) is called mid-draw at the particles' z-position; returning
//   true tells the runtime to skip its 2D particle/shockwave drawing.
// - present({ bloomOn }) is called once per loop after the 2D frame finished;
//   it renders the GPU overlay and returns true when it also handled the
//   bloom pass (the runtime then skips its canvas bloom).
import { Application, BlurFilter, Container, Sprite, Texture } from "pixi.js";
import { isSpark, parseTint, shockEase, sparkTransform } from "./combat-fx-scene.js";

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function bakeDotTexture(size = 32) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas, true);
}

function bakeSparkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 64, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.7, "rgba(255,255,255,.8)");
  gradient.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(58, 0.5);
  ctx.arc(58, 4, 3.5, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(0, 4);
  ctx.fill();
  return Texture.from(canvas, true);
}

function bakeRingTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const half = size / 2, radius = half - 16;
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.shadowColor = "rgba(255,255,255,.9)";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(half, half, radius, 0, TAU); ctx.stroke();
  // faint inner echo at 0.68R, like the legacy double ring
  ctx.globalAlpha = 0.38;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(half, half, radius * 0.68, 0, TAU); ctx.stroke();
  return { texture: Texture.from(canvas, true), radius };
}

export async function createCombatFxStage({ canvas, gameCanvas } = {}) {
  const app = new Application();
  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: clamp(window.devicePixelRatio || 1, 1, 2.5),
    autoDensity: true,
    antialias: true,
    backgroundAlpha: 0,
    autoStart: false,
    sharedTicker: false
  });

  let destroyed = false;
  let captured = null;

  const dotTexture = bakeDotTexture();
  const sparkTexture = bakeSparkTexture();
  const ring = bakeRingTexture();

  // bloom pass: the finished 2D game canvas, blurred and re-added on top
  const bloomSprite = new Sprite();
  bloomSprite.blendMode = "add";
  bloomSprite.alpha = 0.5;
  bloomSprite.filters = [new BlurFilter({ strength: 6, quality: 3 })];
  bloomSprite.visible = false;
  let bloomTexture = null;
  const refreshBloomTexture = () => {
    // a 0×0 canvas (before the legacy first layout pass) would throw on
    // texture creation — present() retries lazily once it has valid dimensions
    if (!gameCanvas || gameCanvas.width === 0 || gameCanvas.height === 0) return;
    const previous = bloomTexture;
    bloomTexture = Texture.from(gameCanvas, true);
    bloomSprite.texture = bloomTexture;
    previous?.destroy(true);
  };
  refreshBloomTexture();

  const world = new Container(); // world-space FX, camera applied via position
  const shockLayer = new Container();
  const particleLayer = new Container();
  particleLayer.blendMode = "add";
  world.addChild(shockLayer, particleLayer);
  app.stage.addChild(bloomSprite, world);

  // lazily grown sprite pools (legacy caps: 850 particles, 32 shocks)
  const particleSprites = [];
  const shockSprites = [];
  const spriteFrom = (pool, layer, texture, anchorX = 0.5) => index => {
    while (pool.length <= index) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(anchorX, 0.5);
      sprite.blendMode = "add";
      sprite.visible = false;
      layer.addChild(sprite);
      pool.push(sprite);
    }
    return pool[index];
  };
  const particleSprite = spriteFrom(particleSprites, particleLayer, dotTexture);
  const shockSprite = spriteFrom(shockSprites, shockLayer, ring.texture);

  const resize = () => {
    if (destroyed) return;
    app.renderer.resolution = clamp(window.devicePixelRatio || 1, 1, 2.5);
    app.renderer.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", resize, { passive: true });

  const hideFrom = (pool, count) => {
    for (let index = count; index < pool.length; index++) pool[index].visible = false;
  };

  const capture = frame => {
    if (destroyed) return false;
    captured = frame;
    return true;
  };

  const present = ({ bloomOn = false } = {}) => {
    if (destroyed) return false;
    const frame = captured;
    captured = null;

    let bloomHandled = false;
    if (frame) {
      const { parts = [], shocks = [], camX = 0, camY = 0, shakeX = 0, shakeY = 0, width, height, darkness = 0 } = frame;
      world.position.set(width / 2 - camX + shakeX, height / 2 - camY + shakeY);
      // the darkness veil lives on the 2D canvas below this overlay — dim the
      // FX layer with it so effects don't punch through the visibility mechanic
      // (kept partially visible: shockwaves/explosions act as light sources)
      world.alpha = 1 - darkness * 0.7;

      let used = 0;
      for (const particle of parts) {
        const sprite = particleSprite(used++);
        const alpha = clamp(particle.life / (particle.maxLife || 1), 0, 1);
        sprite.visible = true;
        sprite.position.set(particle.x, particle.y);
        sprite.tint = parseTint(particle.color);
        sprite.alpha = alpha;
        if (isSpark(particle)) {
          const { length, rotation } = sparkTransform(particle);
          sprite.texture = sparkTexture;
          sprite.anchor.set(1, 0.5);
          sprite.rotation = rotation;
          sprite.scale.set(Math.max(length, particle.size) / 64, particle.size / 5);
        } else {
          sprite.texture = dotTexture;
          sprite.anchor.set(0.5);
          sprite.rotation = 0;
          sprite.scale.set((particle.size * 2.4) / 32);
        }
      }
      hideFrom(particleSprites, used);

      let usedShocks = 0;
      for (const shock of shocks) {
        const sprite = shockSprite(usedShocks++);
        const fade = 1 - shock.life / (shock.maxLife || 1);
        const radius = shock.maxR * shockEase(fade);
        sprite.visible = radius > 1;
        sprite.position.set(shock.x, shock.y);
        sprite.tint = parseTint(shock.color);
        sprite.alpha = (1 - fade) * 0.85;
        sprite.scale.set(radius / ring.radius);
      }
      hideFrom(shockSprites, usedShocks);

      if (bloomOn && gameCanvas?.width > 0 && gameCanvas?.height > 0) {
        // lazy init after a 0×0 start, and re-sync after canvas/DPR resizes
        if (!bloomTexture || bloomTexture.source.pixelWidth !== gameCanvas.width || bloomTexture.source.pixelHeight !== gameCanvas.height) refreshBloomTexture();
        bloomTexture.source.update();
        bloomSprite.width = width;
        bloomSprite.height = height;
        bloomSprite.visible = true;
        bloomHandled = true;
      } else {
        bloomSprite.visible = false;
      }
    } else {
      hideFrom(particleSprites, 0);
      hideFrom(shockSprites, 0);
      bloomSprite.visible = false;
    }

    app.renderer.render(app.stage);
    return bloomHandled;
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("resize", resize);
    // v8 signature: destroy(rendererDestroyOptions, stageDestroyOptions)
    app.destroy({ removeView: false }, { children: true, texture: true, textureSource: true });
  };

  resize();
  return { capture, present, resize, destroy };
}

import { renderWorld } from "./world-renderer.js";
import { renderEntities } from "./entity-renderer.js";
import { renderEffects } from "./effects-renderer.js";

export function createCanvasRenderer(canvas, settings = {}) {
  const context = canvas.getContext("2d", { alpha: false });
  const resize = () => {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  window.addEventListener("resize", resize);
  resize();
  return {
    render(run) {
      context.save();
      if (settings.screenShake && run.camera.shake) context.translate(run.camera.shakeX ?? 0, run.camera.shakeY ?? 0);
      renderWorld(context, run, run.camera);
      renderEntities(context, run, run.camera);
      renderEffects(context, run.effects, run.camera, settings);
      context.restore();
    },
    destroy() { window.removeEventListener("resize", resize); }
  };
}

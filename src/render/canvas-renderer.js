import { renderWorld } from "./world-renderer.js";
import { renderEntities } from "./entity-renderer.js";
import { renderEffects } from "./effects-renderer.js";
import { applyWorldCamera } from "./camera.js";

export function createCanvasRenderer(canvas, settings = {}, services = {}) {
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
      applyWorldCamera(context,run.camera,{width:context.canvas.clientWidth||innerWidth,height:context.canvas.clientHeight||innerHeight},()=>{renderWorld(context, run, run.camera);renderEntities(context, run, run.camera, services.assemblyRenderer, services.assemblyGeometry);renderEffects(context, run.effects, run.camera, settings);});
      context.restore();
    },
    destroy() { window.removeEventListener("resize", resize); }
  };
}

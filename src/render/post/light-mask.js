const MASK_SCALE = .5;
const MAX_LIGHTS = 64;

export function createLightMask() {
  let mask = null;
  return {
    // lights are given in world coordinates; offsetX/offsetY translate world to screen
    apply(ctx, { darkness = 0, lights = [], viewport, offsetX = 0, offsetY = 0 }) {
      if (typeof document === "undefined" || darkness <= 0 || !viewport?.width || !viewport?.height) return;
      const width = Math.max(1, Math.round(viewport.width * MASK_SCALE));
      const height = Math.max(1, Math.round(viewport.height * MASK_SCALE));
      if (!mask) mask = document.createElement("canvas");
      if (mask.width !== width || mask.height !== height) { mask.width = width; mask.height = height; }
      const maskCtx = mask.getContext("2d");
      if (!maskCtx) return;
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.clearRect(0, 0, width, height);
      maskCtx.fillStyle = `rgba(4,2,12,${darkness})`;
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "destination-out";
      for (let index = 0; index < lights.length && index < MAX_LIGHTS; index += 1) {
        const light = lights[index];
        const x = (light.x + offsetX) * MASK_SCALE;
        const y = (light.y + offsetY) * MASK_SCALE;
        const radius = Math.max(2, light.radius * MASK_SCALE);
        if (x + radius < 0 || y + radius < 0 || x - radius > width || y - radius > height) continue;
        const intensity = Math.min(1, light.intensity ?? 1);
        const gradient = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(0,0,0,${intensity})`);
        gradient.addColorStop(.55, `rgba(0,0,0,${intensity * .55})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        maskCtx.fillStyle = gradient;
        maskCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mask, 0, 0, viewport.width, viewport.height);
      ctx.restore();
    }
  };
}

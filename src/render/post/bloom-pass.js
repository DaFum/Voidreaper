export function createBloomPass({ strength = .42, blur = 4 } = {}) {
  let half = null, quarter = null;
  return {
    apply(ctx) {
      if (typeof document === "undefined") return;
      const source = ctx.canvas;
      if (!source?.width || !source?.height) return;
      if (!half) { half = document.createElement("canvas"); quarter = document.createElement("canvas"); }
      const halfWidth = Math.max(1, source.width >> 1), halfHeight = Math.max(1, source.height >> 1);
      const quarterWidth = Math.max(1, source.width >> 2), quarterHeight = Math.max(1, source.height >> 2);
      if (half.width !== halfWidth || half.height !== halfHeight) { half.width = halfWidth; half.height = halfHeight; }
      if (quarter.width !== quarterWidth || quarter.height !== quarterHeight) { quarter.width = quarterWidth; quarter.height = quarterHeight; }
      const halfCtx = half.getContext("2d"), quarterCtx = quarter.getContext("2d");
      halfCtx.globalCompositeOperation = "copy";
      halfCtx.drawImage(source, 0, 0, halfWidth, halfHeight);
      quarterCtx.globalCompositeOperation = "copy";
      quarterCtx.drawImage(half, 0, 0, quarterWidth, quarterHeight);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = strength;
      ctx.imageSmoothingEnabled = true;
      if (blur && "filter" in ctx) ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(quarter, 0, 0, source.width, source.height);
      ctx.restore();
    }
  };
}

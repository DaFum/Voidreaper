import { renderShipCore } from "./core-renderer.js";
import { createModuleCoreRendererRegistry } from "./module-core-renderers.js";
import { renderConnector } from "./connector-renderer.js";
import {
  renderAdaptiveArmor,
  renderBalanceDecorators,
} from "./adaptive-armor-renderer.js";
import { renderActivityAnimations } from "./activity-animation-renderer.js";
import { renderDamageOverlay } from "./damage-overlay-renderer.js";
import { resolveAssemblyLod } from "./assembly-lod-policy.js";
import { getShipStaticLayers } from "./static-layer-cache.js";
import { mergeVisualPalette } from "../forged-abyss/palettes.js";

const ASSEMBLY_RENDER_LAYERS = Object.freeze([
  "lower-structure",
  "ventral-modules",
  "rear-connectors",
  "core-hull",
  "module-cores",
  "adaptive-armor",
  "moving-parts",
  "energy-effects",
  "damage-effects",
  "target-markers",
]);
export function createAssemblyRenderer() {
  const modules = createModuleCoreRendererRegistry();
  const DEFAULT_ACTIVITY = Object.freeze({
    charge: 0,
    cooldown: 0,
    firing: false,
    heat: 0,
    energyFlow: 0.35,
    faulting: false,
    activeUnits: 0,
  });
  return {
    renderPlayerShip(
      ctx,
      {
        geometrySnapshot,
        position,
        rotation = 0,
        time = 0,
        telemetryByNodeId = {},
        buildAnimations = [],
        buildAnimationByNodeId = null,
        movement = {},
        lodOptions = {},
      },
    ) {
      if (!geometrySnapshot?.coreGeometry) return false;
      // ⚡ Bolt: avoided intermediate Map allocation per frame.
      const lod = resolveAssemblyLod({
          zoom: 1,
          visibleSegments: geometrySnapshot.nodes.length - 1,
          particlePressure: 0,
          ...lodOptions,
        }),
        palette = mergeVisualPalette(geometrySnapshot.shipStyle?.palette);
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(rotation);
      const staticLayers = getShipStaticLayers(geometrySnapshot, lod, {
        base: (layerCtx) => {
          for (const connector of geometrySnapshot.connections)
            renderConnector(layerCtx, connector, palette, {
              lod,
              layer: "static",
            });
          renderBalanceDecorators(
            layerCtx,
            geometrySnapshot.decorators,
            palette,
          );
          renderShipCore(layerCtx, geometrySnapshot.coreGeometry, palette, {
            lod,
            seed: geometrySnapshot.shipFrameId,
            layer: "static",
          });
        },
        armor: (layerCtx) =>
          renderAdaptiveArmor(layerCtx, geometrySnapshot.armor, palette),
      });
      if (staticLayers)
        ctx.drawImage(
          staticLayers.base,
          staticLayers.x,
          staticLayers.y,
          staticLayers.width,
          staticLayers.height,
        );
      for (const connector of geometrySnapshot.connections)
        renderConnector(ctx, connector, palette, {
          lod,
          energyFlow: time,
          layer: staticLayers ? "dynamic" : "all",
        });
      if (!staticLayers)
        renderBalanceDecorators(ctx, geometrySnapshot.decorators, palette);
      renderShipCore(ctx, geometrySnapshot.coreGeometry, palette, {
        time,
        lod,
        seed: geometrySnapshot.shipFrameId,
        layer: staticLayers ? "dynamic" : "all",
      });
      for (const node of geometrySnapshot.nodes) {
        if (node.isRoot) continue;
        const activity = telemetryByNodeId[node.nodeId] ?? DEFAULT_ACTIVITY,
          build = buildAnimationByNodeId ? buildAnimationByNodeId.get(node.nodeId) : buildAnimations?.find((b) => b.nodeId === node.nodeId);
        ctx.save();
        ctx.translate(node.worldPosition.x, node.worldPosition.y);
        ctx.rotate(node.worldRotation);
        if (build) {
          ctx.globalAlpha = Math.max(0.18, build.phaseProgress);
          ctx.scale(
            0.72 + 0.28 * build.phaseProgress,
            0.72 + 0.28 * build.phaseProgress,
          );
        }
        modules.render(node.profile.rendererId, ctx, {
          size: node.geometry.size,
          variantSeed: node.variantSeed,
          rotation: 0,
          palette,
          activity,
          damageState: node.damageState,
          time,
          lod,
        });
        ctx.restore();
      }
      if (staticLayers)
        ctx.drawImage(
          staticLayers.armor,
          staticLayers.x,
          staticLayers.y,
          staticLayers.width,
          staticLayers.height,
        );
      else renderAdaptiveArmor(ctx, geometrySnapshot.armor, palette);
      renderActivityAnimations(ctx, geometrySnapshot, {
        time,
        lod,
        palette,
        telemetryByNodeId,
        buildAnimations,
        buildAnimationByNodeId,
        movement,
      });
      for (const node of geometrySnapshot.nodes)
        if (!node.isRoot && node.damageState !== "intact")
          renderDamageOverlay(ctx, node, { time, palette, lod });
      ctx.restore();
      return true;
    },
  };
}

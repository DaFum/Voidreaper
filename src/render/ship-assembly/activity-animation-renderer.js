export function renderActivityAnimations(
  ctx,
  snapshot,
  {
    time,
    lod,
    palette,
    telemetryByNodeId = {},
    buildAnimations = [],
    buildAnimationByNodeId: providedAnimationMap,
    movement = {},
  },
) {
  // ⚡ Bolt: avoided new Map(buildAnimations.map()) to prevent intermediate array allocation in the hot render path
  const getBuildAnimation = (nodeId) => {
    if (providedAnimationMap) {
      return providedAnimationMap.get(nodeId);
    }
    return buildAnimations?.find((b) => b.nodeId === nodeId);
  };
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const node of snapshot.nodes) {
    if (node.isRoot) {
      for (const anchor of snapshot.coreGeometry?.thrusterAnchors ?? []) {
        const strength = Math.min(
          1,
          Math.sqrt(
            (movement.x ?? 0) * (movement.x ?? 0) +
              (movement.y ?? 0) * (movement.y ?? 0),
          ) + (movement.dodging ? 0.8 : 0),
        );
        ctx.globalAlpha = 0.3 + strength * 0.6;
        ctx.fillStyle = palette.thruster;
        ctx.beginPath();
        ctx.ellipse(
          anchor.x,
          anchor.y + 5,
          2.5,
          5 + strength * 8,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      continue;
    }
    const activity = telemetryByNodeId[node.nodeId],
      build = getBuildAnimation(node.nodeId);
    if (!activity?.firing && !(activity?.energyFlow > 0) && !build) continue;
    const pulse = 0.45 + Math.sin(time * 7 + node.variantSeed) * 0.25;
    ctx.globalAlpha =
      lod === "low" ? 0.35 : pulse * (activity?.faulting ? 0.55 : 1);
    ctx.fillStyle = activity?.faulting
      ? palette.fault
      : build?.phase === "power-up"
        ? "#ffc857"
        : palette.energy;
    ctx.beginPath();
    ctx.arc(
      node.worldPosition.x,
      node.worldPosition.y,
      2 + (activity?.charge ?? build?.phaseProgress ?? 0) * 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

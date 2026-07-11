## 2024-05-14 - Canvas Render State Preservation
**Learning:** Overriding `ctx.globalAlpha` explicitly (e.g. `ctx.globalAlpha = 1`) breaks fading states for child objects that depend on an inherited `alpha` value.
**Action:** Instead of hardcoding alpha states inside looping renders, always stash the inherited base alpha (`const baseAlpha = ctx.globalAlpha;`), multiply the calculated local alpha by the base alpha, and restore it before finishing the loop tick or method scope.

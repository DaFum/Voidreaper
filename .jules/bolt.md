## 2024-05-14 - Canvas Render State Preservation
**Learning:** Overriding `ctx.globalAlpha` explicitly (e.g. `ctx.globalAlpha = 1`) breaks fading states for child objects that depend on an inherited `alpha` value.
**Action:** Instead of hardcoding alpha states inside looping renders, always stash the inherited base alpha (`const baseAlpha = ctx.globalAlpha;`), multiply the calculated local alpha by the base alpha, and restore it before finishing the loop tick or method scope.

## 2025-02-18 - Batch Canvas Draw Calls
**Learning:** Calling `beginPath()` and `stroke()` inside nested loops for rendering highly dense geometry grids adds substantial overhead. Grouping elements that share exactly the same stroke styles into a single path significantly increases canvas rendering performance in regions with dense motif layouts. Specifically using `moveTo()` before an `arc()` in the same path prevents an unintended connecting line from the previous sub-path to the start of the arc.
**Action:** Always batch canvas `beginPath`/`stroke` calls for elements sharing a style by lifting these commands outside rendering loops. Use `moveTo` to manage pen positioning effectively.

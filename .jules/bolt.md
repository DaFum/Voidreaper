## 2024-05-14 - Canvas Render State Preservation
**Learning:** Overriding `ctx.globalAlpha` explicitly (e.g. `ctx.globalAlpha = 1`) breaks fading states for child objects that depend on an inherited `alpha` value.
**Action:** Instead of hardcoding alpha states inside looping renders, always stash the inherited base alpha (`const baseAlpha = ctx.globalAlpha;`), multiply the calculated local alpha by the base alpha, and restore it before finishing the loop tick or method scope.

## 2025-02-18 - Batch Canvas Draw Calls
**Learning:** Calling `beginPath()` and `stroke()` inside nested loops for rendering highly dense geometry grids adds substantial overhead. Grouping elements that share exactly the same stroke styles into a single path significantly increases canvas rendering performance in regions with dense motif layouts. Specifically using `moveTo()` before an `arc()` in the same path prevents an unintended connecting line from the previous sub-path to the start of the arc.
**Action:** Always batch canvas `beginPath`/`stroke` calls for elements sharing a style by lifting these commands outside rendering loops. Use `moveTo` to manage pen positioning effectively.

## 2025-02-18 - Math.hypot Performance Bottleneck
**Learning:** `Math.hypot` is a severe performance bottleneck in V8 compared to calculating the Euclidean distance manually using `Math.sqrt(x*x + y*y)` (approximately 50x slower). This occurs due to its handling of variable arguments and extensive underflow/overflow protection which is unnecessary for normal vector math in game loops.
**Action:** Never use `Math.hypot` for distance calculations in high-frequency rendering/gameplay loops. Always use `Math.sqrt(dx*dx + dy*dy)` or check distance squared when the exact distance isn't needed.

## 2025-02-18 - Avoid Intermediate Array Allocations in Hot Paths
**Learning:** Using chained array methods like `.filter()`, `.slice()`, or using the spread operator (`[...map.values()]`) with `.reduce()` on Collections like Maps inside high-frequency game loops (such as the nanite controller iterating over enemies) creates unnecessary intermediate array allocations. This leads to increased Garbage Collection overhead and performance degradation (observed as >2x slower in benchmarks).
**Action:** When iterating over collections in hot paths, avoid array methods and spread operators. Instead, use indexed `for` loops (e.g. `for (let i = 0; i < arr.length; i++)`) with early `break` statements, or iterate over Maps directly using `for...of` (e.g. `for (const val of map.values())`).
## 2024-05-18 - Encapsulating memoization with WeakMap
**Learning:** When optimizing repetitive calculations like `flattenSectorMap` that depend on immutable or infrequently changing parent objects, storing the cache in a closure `WeakMap` inside the generator/utility file is safer and cleaner than forcing callers to hold references.
**Action:** Use `WeakMap` for transparent object-keyed caching inside utility functions to prevent memory leaks and keep call sites simple.
## 2024-07-24 - V8 Array Map Allocation Bottleneck
**Learning:** In highly frequent HTML5 Canvas render loops (like `renderActivityAnimations` or `renderPlayerShip`), using `new Map(arr.map(x => [k, v]))` forces V8 to allocate intermediate array wrappers and nested closure tuples every frame. This triggers frequent GC sweeps which manifest as micro-stutters during rendering.
**Action:** Replace functional `.map()` patterns with imperative `for` loops inside hot rendering paths when populating collections to avoid intermediate object allocation overhead.
## 2024-06-25 - Avoid spreading Maps and Sets in hot paths
**Learning:** In V8 and Node.js, `[...map.values()]` creates a new iterator and converts it into a fresh array via spreading. If you chain this with `.filter()`, `.map()`, and `.flat()`, you allocate multiple temporary arrays for every single execution. In high-frequency hot paths (like `snapshotFromCache` in assembly rendering), this causes heavy Garbage Collection (GC) overhead and frame stutter.
**Action:** Always replace spread array creation on Maps and Sets with a single-pass `for...of` loop over the iterator, pushing into a pre-allocated or newly created array. Never use `.flat()` inside a frame render function if it can be avoided by nested loops.

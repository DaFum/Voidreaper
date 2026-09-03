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

## 2024-06-25 - Splice inside loops

**Learning:** Using `Array.prototype.splice()` inside a loop that iterates over a large array (especially in high-frequency rendering or assembly logic) can cause severe performance issues due to the O(n) array element shifting on every call, leading to O(n^2) overall time complexity.

**Action:** Instead of `splice`, use the "swap and pop" pattern (if order doesn't matter) or assign the index to `null` and do a single pass cleanup at the end (e.g., using `filter(Boolean)`) to improve performance.

## 2025-02-18 - Math.atan2 + Math.cos/sin Performance Bottleneck
**Learning:** Using `Math.atan2` followed immediately by `Math.cos` and `Math.sin` to calculate normalized velocity components is a severe performance bottleneck in hot loops compared to calculating the Euclidean distance manually using `Math.sqrt(dx*dx + dy*dy)` and normalizing via division. Benchmarks show direct vector normalization is ~7-8x faster in Node.js/V8.
**Action:** Never use `Math.atan2` just to feed `Math.cos` and `Math.sin` for distance/velocity calculations in high-frequency rendering/gameplay loops. Always use `Math.sqrt(dx*dx + dy*dy)` and division to extract the normalized components.

## 2024-11-20 - Deferring Math.sqrt in hot loops

**Learning:** Using chained array allocations (`.map()`) inside a `Math.min()` call for distance computation allocates massive garbage. Furthermore, calling `Math.sqrt()` per element is unnecessary overhead when we only need to find the minimum distance.
**Action:** Replace `Math.min(...arr.map(calculateDistance))` with an imperative `for` loop that compares squared distances (`dx*dx + dy*dy`), and only apply `Math.sqrt()` once to the final minimum value. This significantly reduces CPU overhead and avoids intermediate array allocations.

## 2025-02-18 - Avoiding intermediate array allocations and O(n^2) scaling inside hot loops

**Learning:** Performing `Array.prototype.map()` during each loop iteration to provide weights, and removing the selection using `Array.prototype.splice()`, created large amounts of garbage and an O(n^2) scaling factor in the `createAffixRoller.roll` method. In highly active loops, this takes seconds of CPU time and triggers severe stuttering. Additionally, while "swap and pop" is an O(1) way to remove elements, it changes the cumulative element order, which can break seeded RNG determinism in multi-roll tests that rely on `rng.weighted()`.
**Action:** When filtering array elements by weighted RNG selections, precalculate weights into arrays outside the loop. Use `splice()` for removal if array order dictates deterministic RNG sequences, otherwise use "swap and pop" (`arr[idx] = arr[arr.length-1]; arr.pop();`) to remove selected candidates in O(1) time.

## 2024-08-09 - Set Operations for Multiple Includes
**Learning:** `Array.prototype.includes` or `Object.values().includes` evaluated in hot paths like input handling (which runs every keyboard and mouse event) introduces unnecessary O(N) array allocations and linear searches, increasing GC pressure and lowering performance.
**Action:** Replace dynamic array includes with a static `Set` initialized once, using `Set.prototype.has()` for an O(1) constant-time lookup.

## 2024-05-18 - [Blueprint Matcher Sorting Optimization]
**Learning:** In `blueprint-matcher.js`, finding the best blueprint match involved sorting candidates using an inline array creation (`["exact", "compatible", ...]`) and multiple `indexOf` calls inside the `.sort()` comparator loop. This caused significant `O(N log N)` array allocations and string searches, creating heavy garbage collection overhead in a potentially hot path.
**Action:** When prioritizing or sorting based on categorical strings, always extract the mapping to a static dictionary/object (e.g., `const MATCH_PRIORITY = { exact: 0, compatible: 1, ... }`) outside the sorting loop to guarantee `O(1)` property lookups and prevent intermediate array allocations per element comparison.

## 2024-05-18 - Avoid chained array extractions
**Learning:** Chained array methods that extract a limited subset (e.g., `.filter(condition).slice(0, limit).map(...)`) are a performance bottleneck because they force a full O(N) traversal of the initial array and allocate multiple intermediate arrays before slicing.
**Action:** When extracting a subset with a known limit, replace chained methods with an imperative `for` loop, tracking the extracted count, pushing to a results array, and using `break` once the limit is reached to short-circuit execution.
## 2024-05-18 - Raycasting and Angle Normalization Hot Path Optimization
**Learning:** In hot geometric algorithms (like AABB ray intersections and angular distance checking), dynamic property access (e.g., \`bounds[\`min\${axis}\`]\`), array instantiations for loop iterations (e.g., \`[["x", dx], ["y", dy]]\`), and chained array methods (\`Array.from().filter().some()\`) create massive garbage collection pressure and CPU overhead. Additionally, using \`Math.atan2(Math.sin(), Math.cos())\` just to normalize an angle is vastly slower than using a simple modulo operation.
**Action:** When calculating angle differences, use \`let a = Math.abs(value) % (Math.PI * 2); return a > Math.PI ? Math.PI * 2 - a : a;\` instead of trigonometry. Always unroll axis-based iterations into explicit \`x\` and \`y\` blocks to allow constant-time property access, and strictly replace all functional array chains with imperative \`for\` loops in high-frequency rendering or collision paths.

## $(date +%Y-%m-%d) - Optimize Array Removal in Drone Controller
**Learning:** When optimizing array removals in performance-critical paths where the array cannot be reassigned (e.g., referenced externally or accessed via getters), avoid using `splice()` in a loop as it causes O(N²) time complexity.
**Action:** Use an O(N) in-place two-pointer filtering approach (e.g., `arr[writeIdx++] = arr[i]`) combined with an O(1) lookup structure (like a `Set`) and truncate the array afterwards (`arr.length = writeIdx`) to preserve the original array reference while drastically improving performance.

## 2025-02-18 - Replacing map/filter in Hot Paths
**Learning:** In highly frequent spatial queries, such as updating and querying the ship assembly hit-zone index (`hit-zone-index.js`), using `.filter(..).map(..)` chaining causes continuous dynamic array allocations. The Garbage Collection (GC) overhead compounds drastically under load and can negatively impact framerates.
**Action:** Replace all `.filter().map()` array manipulation chains inside high-frequency collision or indexing paths with pre-allocated arrays (or re-used arrays where possible) and imperative single-pass `for` loops.
## 2024-05-18 - Avoid spreading Map iterators into arrays for sorting
**Learning:** Spreading Map iterators into arrays (e.g., `[...map.entries()]`) to perform `.sort()` operations just to find a maximum or minimum value is highly inefficient. It allocates intermediate arrays and performs O(N log N) sorting when an O(N) imperative loop could find the max/min value without array allocations.
**Action:** In performance-critical paths, use an imperative `for...of` loop to iterate over `map.entries()` and track the maximum/minimum value manually to avoid unnecessary allocations and overhead.

## 2025-02-18 - Replacing Object.values().find() and O(N) Array.find in Assembly and Inventory Lookups
**Learning:** Using `Object.values().find()` in fallback selectors, port resolution loops, or debug scenarios creates intermediate array allocations on every call. Similarly, using `Array.prototype.find()` on inventory arrays scales linearly O(N) and creates CPU bottlenecks in frequently called service methods like `requireInstance` or `store`.
**Action:** Replace `Object.values().find()` with direct `for...in` loops over the dictionary object to eliminate intermediate array allocations and allow early termination. For inventory instance lookups, maintain a cached `Map` index keyed by `instanceId` to turn O(N) array scans into O(1) constant-time lookups.

## 2024-03-24 - Intermediate array allocations via chained mapping
**Learning:** In V8, chaining `.values()`, `.flat()`, `.filter()`, and `.map()` on an object with many small properties (like loadout slots) forces the engine to allocate multiple intermediate array closures per call. In hot paths (like `loadout-service` queries called during inspect or render cycles), this causes measureable GC pressure and stuttering.
**Action:** Replace `.values().flat().filter().map()` chains with single-pass imperative `for...in` or `for...of` loops, pushing directly to a single pre-allocated (or dynamically built) array.

## 2024-05-18 - Optimize getBranchNodeIds traversal with Adjacency List
**Learning:** In recursive tree traversals (like ship assembly graphs), performing an O(N) lookup for children inside a while loop for every node in the branch results in O(N * V) complexity (where N is total nodes, V is branch size) and heavy array allocation overhead.
**Action:** When traversing tree structures, pre-compute an adjacency list (e.g., `childrenByParent` map) in a single O(N) pass to reduce traversal complexity to O(N + V) and eliminate intermediate array allocations from `.filter()` or spread operators.

## 2024-05-18 - Safe Object Maps for Iteration
**Learning:** When using objects as lookup maps/dictionaries (like adjacency lists), `__proto__`, `constructor`, etc can cause runtime collisions if not handled, and `Object.hasOwn` checks are necessary when building arrays unless `Object.create(null)` is used. Furthermore, omitting nodes with falsy parentIDs (e.g. `0` or `""`) is incorrect if those IDs are technically valid in the data model.
**Action:** Always use `Object.create(null)` for ad-hoc lookup maps instead of `{}` to avoid prototype inheritance issues, and check against `null` or `undefined` instead of falsy values when evaluating IDs.

## 2024-05-24 - Micro-optimizing Selectors is an Anti-Pattern
**Learning:** Replacing chained array methods (`Object.values().filter()`) with imperative `for...in` loops in state selectors (like `selectRealSegments` in Redux-like environments) is an anti-pattern. While it technically avoids O(N) intermediate array allocations and reduces GC pressure, it sacrifices code readability and maintainability for negligible performance gains unless the dataset is massive. Furthermore, the real performance bottleneck in selectors is returning a *new array reference* on every call, which causes unnecessary component re-renders.
**Action:** Never apply this specific array method optimization to state selectors. Instead, favor memoization/caching (e.g., using `reselect` or similar) to ensure referential equality when state hasn't changed. Reserve the imperative loop optimization for true hot paths (like game rendering loops, high-frequency physics checks, or recursive graph algorithms).

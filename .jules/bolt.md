## 2024-06-25 - Splice inside loops
**Learning:** Using `Array.prototype.splice()` inside a loop that iterates over a large array (especially in high-frequency rendering or assembly logic) can cause severe performance issues due to the O(n) array element shifting on every call, leading to O(n^2) overall time complexity.
**Action:** Instead of `splice`, use the "swap and pop" pattern (if order doesn't matter) or assign the index to `null` and do a single pass cleanup at the end (e.g., using `filter(Boolean)`) to improve performance.

## Proof for LeetCode 2659 (Make Array Empty)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given an array `nums` of distinct integers, repeatedly apply: if the first element is the current minimum, remove it; otherwise, move it to the end. Return the total number of operations needed to empty the array.

### Notation
- `n` — length of `nums`
- `ascItems` — array of `{ value, originalIndex }` pairs sorted by ascending `value`

---

### Key Observations

#### Observation 1 — Each full pass costs exactly `|remaining|` operations
Define `fullPass(remainedItems)` as one complete left-to-right traversal of the array state at the beginning of a pass, where `remainedItems` contains exactly the elements not removed by previous passes.

Assume the current `nextPassItemsArray` (i.e., `remainedItems`) contains `X` elements. Both operations — removal (the element is the current minimum) and move-to-end (it is not) — necessarily advance the pointer to the next element. Therefore, visiting every element in `nextPassItemsArray` requires exactly `X` operations, regardless of how many elements are actually removed during the pass.

**Example**: Consider `nums = [5, 6, 1]`. Initially `nextPassItemsArray = [5, 6, 1]` with 3 elements. During the first pass, only value 1 can be removed (it is the minimum). After 3 operations, the pass completes and `nextPassItemsArray = [5, 6]`. The second pass costs 2 operations and removes both elements. Total: `3 + 2 = 5` operations.

Note that whether an element is removable does not affect the operation count per pass — only the number of remaining elements matters. For instance, in `[5, 9, 7]`, we cannot remove 9 while 7 exists, but the first pass still costs 3 operations.

#### Observation 2 — Post-pass index monotonicity
After any full pass, the remaining elements in `nextPassItemsArray` form a subsequence of the original array whose original indices are strictly ascending.

**Reasoning**: Initially, the original indices of `nums` are trivially ascending: `0, 1, ..., n-1`. Each pass removes a subset of elements. Since removing elements from an ascending index sequence preserves the ascending property for the remaining indices, this invariant holds after every pass.

**Example**: After the first pass on `[5, 9, 4]`, the minimum value 4 is removed, leaving `[5, 9]` with original indices `0, 1` — still ascending.

#### Observation 3 — Deletions per pass equal the LMAAS
During one full pass over `nextPassItemsArray`, an element can be removed only if it is the current minimum at the time it is visited. Since elements are visited left-to-right (by ascending original index), and removals occur in ascending value order, the set of elements removable in a single pass is exactly the **Longest Minimum-Anchored Ascending Subsequence (LMAAS)**:
- It is a subsequence of `nextPassItemsArray` (the pass-start state), not necessarily contiguous.
- It must start from the currently smallest remaining value (minimum-anchored).
- It is ascending both value-wise and original-index-wise.

The ascending-value property guarantees that each element is removed **only after all smaller elements have already been removed** during this pass. The ascending-index property guarantees that each removable element is encountered in the correct left-to-right traversal order — if the next-smallest element's original index is to the left of the previously removed element, it has already been passed in this traversal and must wait for the next pass.

**Examples**:
- `nextPassItemsArray = [3, 4, 5]`: `|LMAAS| = 3` (values 3, 4, 5 — indices are ascending). Each visit encounters the current minimum, so all three elements are removed in one pass.
- `nextPassItemsArray = [3, 9, 4]`: `|LMAAS| = 2` (values 3, 4 — indices 0, 2 are ascending). Value 9 cannot be removed because when it is visited, the smaller value 4 still exists.

#### Observation 4 — Efficient LMAAS computation via upfront sorting
Computing the LMAAS independently for each pass still becomes expensive. Even though LMAAS is not the classical LIS (because it is minimum-anchored), a naive per-pass approach that recomputes the removable set from scratch can still cost `O(n log n)` per pass in typical implementations, leading to `O(n^2 log n)` overall in the worst case — and therefore not improving over straightforward quadratic simulation. In other words, Observation 3 provides a clean characterization, but we must leverage it further to achieve a real performance benefit.

**Idea**: Sort all elements by ascending value while retaining their original indices, producing `ascItems`. Maintain a pointer `ascIndex` into this sorted array. Within each pass, advance `ascIndex` as long as the original index of the current element exceeds that of the previous one (i.e., the ascending-index property holds). When this property breaks, a new pass begins.

From the `nextPassItemsArray` perspective, removed elements form the LMAAS subsequence. From the `ascItems` perspective, the same removed elements appear as a contiguous prefix of the still-unprocessed suffix of `ascItems`.

**Example**: Consider `nextPassItemsArray = [3, 7, 8, 4]`. The LMAAS is `{3, 4}` with `|LMAAS| = 2`. Using the sorted array: `ascItems = [{ 3, idx 0 }, { 4, idx 3 }, { 7, idx 1 }, { 8, idx 2 }]`. Starting from `{ 3, idx 0 }`, advancing to `{ 4, idx 3 }` preserves ascending indices (`3 > 0`), but advancing further to `{ 7, idx 1 }` breaks the property (`1 < 3`), marking the start of the next pass.

**Block-concatenation view of `ascItems`**: The sorted array can be viewed as a concatenation of maximal contiguous blocks whose original indices are strictly ascending. Each such block corresponds to the exact set of items deleted in one pass.

**Example**: For `nums = [3, 1, 2]`, we have `ascItems = [{ 1, idx 1 }, { 2, idx 2 }, { 3, idx 0 }]`, which splits into:
- Block 1: `[{ 1, idx 1 }, { 2, idx 2 }]` (indices ascending: `1 < 2`)
- Block 2: `[{ 3, idx 0 }]`

This matches the real process exactly: pass 1 removes `{1, 2}`, and pass 2 removes `{3}`.

So the key complexity point is this: in a literal brute-force simulation, elements are revisited once per pass. In the optimized method, we do not rebuild pass states; instead, we scan `ascItems` once and identify pass boundaries by index breaks. Therefore each `ascItems` entry is processed exactly once by `ascIndex`, giving an `O(n)` sweep after sorting.

**Implementation note**: An alternative to explicit sorting is a TreeMap (e.g., `std::map` in C++), which maintains sorted order and provides a convenient size API for tracking the remaining element count.

---

### Algorithm Outline
1. Create `ascItems`: an array of `{ value, originalIndex }` pairs from `nums`, sorted by ascending `value`.
2. Initialize `totalOperations = 0` and `ascIndex = 0`.
3. **Main loop** (while `ascIndex < n`):
   - Compute `remainingCount = n - ascIndex` (number of elements not yet removed).
   - Add `remainingCount` to `totalOperations` (Observation 1: one full pass costs `|remaining|` operations).
   - **Inner loop** (simulate one full pass — compute the LMAAS): Initialize `prevIndex = -1`. While `ascIndex < n` and `ascItems[ascIndex].originalIndex > prevIndex`:
     - Set `prevIndex = ascItems[ascIndex].originalIndex`.
     - Increment `ascIndex` (this element is removed during the current pass).
   - The inner loop terminates when the ascending-index property breaks (Observation 3), marking the end of this pass.
4. Return `totalOperations`.

---

### Correctness Sketch
- **Observation 1** establishes that each full pass over `nextPassItemsArray` costs exactly `|remaining|` operations, regardless of how many elements are removed — both removal and move-to-end advance the pointer equally.
- **Observation 2** guarantees that remaining elements always maintain ascending original indices after each pass, preserving the structural invariant needed for subsequent passes.
- **Observation 3** characterizes the exact set of elements removable per pass as the LMAAS — the longest minimum-anchored ascending subsequence in the pass-start array (`nextPassItemsArray`). Elements outside this subsequence cannot be removed because they violate either the value or index ordering required for removal during a single left-to-right traversal.
- **Observation 4** shows that sorting by value upfront and sweeping with a single pointer computes all per-pass LMAAS boundaries in `O(n)` total; in `ascItems`, each pass corresponds to consuming a contiguous prefix of the still-unprocessed suffix.

Together, these observations show why the counting is correct and efficient. We add `|remaining|` once per pass (Observation 1), and we locate each pass exactly by scanning `ascItems` until the first index-monotonicity break (Observations 3-4). Equivalently, `ascItems` decomposes into ascending-index blocks, and each block is exactly the set of items deleted in one pass.

### Complexity
- **Time**: `O(n log n)` — Dominated by sorting. The main-loop sweep is `O(n)` since `ascIndex` advances at most `n` times total.
- **Space**: `O(n)` — For the sorted `ascItems` array.

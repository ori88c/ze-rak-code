## Proof for LeetCode 2009 (Minimum Number of Operations to Make Array Continuous)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given an integer array `nums`, in one operation you can replace any element with any integer. An array is *continuous* if all elements are unique and `max - min == nums.length - 1`. Return the minimum number of operations to make `nums` continuous.

### Notation
- `n` - length of `nums`
- `ascUniqueNums` - the array obtained by removing duplicate values from `nums` and sorting the remaining values in ascending order; its length is denoted `m`
- `maxValidDiff = n - 1` - the maximum difference between the minimum and maximum elements of a continuous array of length `n`
- `window(i)` - for a given left index `i`, the half-open interval `[i, j)` over indices of `ascUniqueNums` such that `ascUniqueNums[j-1] - ascUniqueNums[i] <= maxValidDiff` and `j` is maximized. Its size `j - i` represents the number of **unchanged** values from `nums` that fit within this candidate range.

---

### Key Observations

#### Observation 1 - Duplicate reduction to sorted unique values
A continuous array requires all elements to be unique. Therefore, among indices holding the same value, at most one copy can remain - the rest must be replaced. Since the continuous property is permutation-agnostic (it depends only on the set of values, not their order), we can arbitrarily choose which copy / instance of each duplicated value to retain.

This justifies a preprocessing step: deduplicate and sort `nums` to obtain `ascUniqueNums`. Every subsequent observation operates on `ascUniqueNums`. The answer is recovered via the identity `minOperations = n - maxUnchangedCount`, where `maxUnchangedCount` is the maximum number of distinct existing values that fit within a single valid continuous range.

#### Observation 2 - Range constraint on unchanged values

**Claim**: No two unchanged values in a continuous array of length `n` can differ by more than `maxValidDiff = n - 1`.

**Proof by contradiction**: Suppose two unchanged values `u < v` satisfy `v - u > maxValidDiff`. A continuous array containing both must include every integer in `[u, v]`, requiring at least `v - u + 1 > n` distinct values - but the array has exactly `n` positions. Since an operation can only replace an existing element (not extend the array), this is impossible.

**Example**: For `nums = [1, 8, 9]` (`n = 3`, `maxValidDiff = 2`), retaining both 1 and 8 would require filling in values 2 through 7 as well, demanding at least 8 positions in a 3-element array.

#### Observation 3 - The optimal range can be anchored at an existing value

**Claim**: There exists an optimal continuous range `[a, a + maxValidDiff]` where `a` appears in `ascUniqueNums`.

**Proof**: Let `[a, a + maxValidDiff]` be an optimal range, and suppose `a ∉ ascUniqueNums`. Define `a' = min{ v ∈ ascUniqueNums | v > a }` - the smallest existing value bigger than `a`. By definition of `a'`, no value in `nums` falls in the interval `[a, a' - 1]`, so shifting the range to `[a', a' + maxValidDiff]` loses zero retained values on the left. Meanwhile, the shifted range extends further to the right (`a' + maxValidDiff >= a + maxValidDiff`), so it can only gain additional unchanged values. The shifted range is therefore at least as good.

This reduces the search space from all integers to the `m` values in `ascUniqueNums`, without loss of optimality.

**Candidate window**: Given this result, each index `i` in `ascUniqueNums` defines a candidate continuous range `[ascUniqueNums[i], ascUniqueNums[i] + maxValidDiff]`. The values from `nums` falling within this range form a contiguous subarray `window(i) = [i, j)` of `ascUniqueNums` (since `ascUniqueNums` is sorted), where `j` is the largest index satisfying `ascUniqueNums[j-1] - ascUniqueNums[i] <= maxValidDiff`. The unchangeable count for this anchor is `j - i`, and the corresponding number of replace operations is `n - (j - i)`.

Minimizing operations count is therefore equivalent to maximizing the window size:
`minOperations = n - max{ |window(i)| | 0 <= i < m }`.

#### Observation 4 - Right-pointer monotonicity enables a two-pointer sweep
Observation 3 alone yields an `O(m²)` solution if we search for the optimal right boundary from scratch for each left-anchor. We can reduce the total sweep to `O(m)` by observing that the right boundary is **monotonically non-decreasing** as the anchor index advances.

**Proof**: Let `j` be the exclusive right boundary for anchor index `i`, i.e. the smallest index with `ascUniqueNums[j] - ascUniqueNums[i] > maxValidDiff` (or `m` if no such index exists). We claim `j* >= j` for anchor `i + 1`.

Since `ascUniqueNums` contains strictly increasing values, `ascUniqueNums[i+1] > ascUniqueNums[i]`. For any index `k` satisfying `i + 1 <= k < j` (i.e., `k` was inside the window for anchor `i`):

`ascUniqueNums[k] - ascUniqueNums[i+1] < ascUniqueNums[k] - ascUniqueNums[i] <= maxValidDiff`

So every index valid for anchor `i` (excluding `i` itself) remains valid for anchor `i + 1`. The first violating index for `i + 1` is therefore at index `j` or later, establishing `j* >= j`.

This means the right pointer never retreats, conforming to the classical two-pointer pattern: the left pointer advances by 1 each outer iteration, while the right pointer only moves forward within a nested loop (until the window invariant is violated), yielding `O(m)` total pointer movements.

---

### Algorithm Outline
1. **Preprocess**: Deduplicate and sort `nums` to produce `ascUniqueNums` of length `m` (Observation 1).
2. Initialize `maxWindowSize = 0` and right pointer `j = 0`.
3. **Main loop** - for each left pointer `i` from `0` to `m - 1`:
   - **Expand right**: While `j < m` and `ascUniqueNums[j] - ascUniqueNums[i] <= maxValidDiff`, increment `j`.
   - Update `maxWindowSize = max(maxWindowSize, j - i)`.
   - **Early exit**: If `j == m`, break — subsequent iterations can only shrink the window since `j` is fixed at `m` while `i` continues to advance.
4. Return `n - maxWindowSize`.

### Correctness Sketch
- **Observation 1** justifies operating on deduplicated sorted values: duplicates must be replaced regardless, and the continuous property is permutation-agnostic.
- **Observation 2** establishes the fundamental range constraint: retained values must lie within a span of at most `maxValidDiff`, bounding the candidate window.
- **Observation 3** reduces the infinite search space to `m` candidate left-anchors (one per distinct value), each defining a contiguous window over `ascUniqueNums`. Maximizing window size directly minimizes the number of replacement operations.
- **Observation 4** proves that the right boundary is monotonically non-decreasing, enabling a single two-pointer sweep that evaluates all candidate windows in `O(m)` total time.

Together, these observations ensure the algorithm finds the globally optimal range - and hence the minimum number of operations - by evaluating every candidate left-anchor in linear time after sorting.

### Complexity
- **Time**: `O(n log n)` — Dominated by sorting. The two-pointer sweep is `O(m) ⊆ O(n)` since each pointer advances at most `m` times.
- **Space**: `O(m) ⊆ O(n)` — For the `ascUniqueNums` array.

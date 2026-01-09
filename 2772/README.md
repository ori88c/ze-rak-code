## Proof for LeetCode 2772 (Apply Operations to Make All Array Elements Equal to Zero)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given an array `nums` and an integer `k`, determine if it is possible to make all array elements equal to zero by repeatedly applying the following operation: choose an index `i` where `i + k <= nums.length`, and decrement all elements in the subarray `[i, i+k)` by 1. Return `true` if achievable, `false` otherwise.

### Notation
- `n` — length of the input array `nums`  
- `k` — operation window size (number of consecutive elements to decrement)  
- `op(start, M)` — apply the operation `M` times on the subarray `[start, start+k)`, decrementing each element by `M`  
- `V` — the value at the current leftmost non-zero index  
- `accumulated_decrement` — cumulative decrement applied to the current index from previous operations

---

## Part I: O(nk) Greedy Brute Force Solution

This section establishes the foundational greedy approach, which processes elements from left to right and directly applies decrements to k-length windows.

### Key Observations

#### Observation 1 — Leftmost positive must be processed first
Consider the leftmost non-zero element at index `i` with value `V > 0`. All elements in the prefix `[0, i)` are already zero.

**Claim**: We must apply `op(i, V)` at some stage.

**Proof by elimination**:
1. We cannot apply `op(i', V')` for any `i' < i`, as this would decrement elements in `[0, i)`, causing negative values in the already-zero prefix.
2. If we entirely avoid operations starting at index `i`, then `nums[i]` can never reach zero, since only operations starting at `i` or earlier can affect `nums[i]`, and we established that operations starting before `i` are invalid.
3. If we apply `op(i, v)` for `v < V`, then `nums[i]` remains positive after all operations.
4. If we apply `op(i, v)` for `v > V`, then `nums[i]` becomes negative.

By eliminating all other possibilities, the unique valid choice is `op(i, V)`.

#### Observation 2 — Exact operation count is mandatory
When processing index `i` with value `V`, we must perform exactly `V` operations starting at `i`. Applying fewer operations leaves `nums[i]` non-zero; applying more makes it negative. Both violate the problem constraints.

#### Observation 3 — Post-operation validation
After applying `op(i, V)`, if any element in the affected range `[i+1, i+k)` becomes negative, no valid solution exists. This validation is legitimate because `op(i, V)` is non-optional (proven in Observation 1), so if its execution causes negative values, the problem is unsolvable.

#### Observation 4 — Sequential left-to-right processing
Repeat the process on the updated array: find the next leftmost positive index (strictly greater than the current index), apply the mandatory operation, validate, and continue. This greedy iteration processes the array from left to right, ensuring all elements eventually reach zero if a solution exists.

### Algorithm Outline (Brute Force)
1. Iterate through the array from left to right (index `i = 0` to `n-1`):
   - Skip indices where `nums[i] == 0`.
   - For each non-zero `nums[i]`:
     - If `i + k > n`, return `false` (insufficient elements for a complete k-window).
     - Apply `op(i, nums[i])`: decrement all elements in `[i, i+k)` by `nums[i]`.
     - If any element in `[i+1, i+k)` becomes negative, return `false`.
2. If all elements successfully reach zero, return `true`.

### Complexity (Brute Force)
- **Time**: `O(nk)` — Each of the `n` elements may trigger an operation affecting `k` elements.  
- **Space**: `O(n)` — A separate copy of the array is maintained to track updated values as each operation modifies `k` elements ahead.

---

## Part II: O(n) Optimized Solution with O(k) Space

The brute force approach repeatedly decrements k elements for each operation, leading to redundant work. This section optimizes the solution by maintaining accumulated decrements using a sliding window technique.

### Key Observations

#### Observation 5 — Sliding window maintains accumulated decrements
Instead of physically decrementing future elements, maintain an `accumulated_decrement` variable that tracks the total decrement applied to the current index from all previous operations. When we apply `op(i, V)`, we:
1. Increment `accumulated_decrement` by `V` (affecting indices `[i, i+k)`).
2. Schedule a "fix" at index `i+k` to stop counting this decrement for indices beyond the window.

This transforms the problem: at each index `i`, the effective value is `nums[i] - accumulated_decrement`.

#### Observation 6 — Queue-based incremental fix mechanism
Operations applied at different indices affect overlapping windows. An operation starting at index `i` affects indices `[i, i+k)`, so **its contribution should be removed** when processing index `i+k`.

Since operations are processed left-to-right in **monotonically increasing index order**, the "fix times" (when to stop counting a decrement) also occur in increasing order. A **queue** efficiently maintains these scheduled fixes, with the earliest fix always at the front.

Each queue entry stores:
- `increase_by`: the amount to subtract from `accumulated_decrement`
- `from_index`: the index where this fix applies

When processing index `i`, if a fix exists with `from_index == i`, dequeue it and reduce `accumulated_decrement` accordingly.

### Algorithm Outline (Optimized)
1. Initialize:
   - `accumulated_decrement = 0`
   - `fixes_queue = []` (empty queue)
2. For each index `i` from `0` to `n-1`:
   - **Apply scheduled fixes**: While `fixes_queue` is non-empty and `fixes_queue.front().from_index == i`:
     - Subtract `fixes_queue.front().increase_by` from `accumulated_decrement`
     - Dequeue the front element
   - **Calculate effective value**: `effective_value = nums[i] - accumulated_decrement`
   - **Validate**: If `effective_value < 0`, return `false` (previous operations caused negativity)
   - **Skip zeros**: If `effective_value == 0`, continue to next index
   - **Apply operation**: If `effective_value > 0`:
     - Verify `i + k <= n` (sufficient elements for k-window), otherwise return `false`
     - Increment `accumulated_decrement` by `effective_value`
     - Enqueue `{ increase_by: effective_value, from_index: i+k }`
3. Return `true` (all elements successfully zeroed)

### Correctness Sketch
- **Observations 1-4** establish the greedy foundation: leftmost elements must be processed with exact operation counts in sequential order.
- **Observation 5** introduces the sliding window abstraction: instead of physically modifying future elements, maintain their inferred decrements via `accumulated_decrement`.
- **Observation 6** justifies the queue data structure: fixes occur in monotonically increasing index order, so the earliest fix is always at the front, eliminating the need for a priority queue.

Together, these observations prove that the optimized algorithm computes identical results to the brute force approach while avoiding redundant operations, achieving linear time complexity.

### Complexity (Optimized)
- **Time**: `O(n)` — Single pass through the array with O(1) queue operations per element.  
- **Space**: `O(k)` — At most `k` pending fixes in the queue at any time (operations within a k-length sliding window).

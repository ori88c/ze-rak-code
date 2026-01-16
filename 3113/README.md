## Proof for LeetCode 3113 (Find the Number of Subarrays Where Boundary Elements Are Maximum)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given an array `nums`, count subarrays `[l, r]` where `nums[l] == nums[r]` and this boundary value equals the maximum element in the subarray.

### Notation
- `n` — length of `nums`
- `CS` (Countable Subarray) — a subarray `[l, r]` satisfying both constraints: `nums[l] == nums[r]` and `max{ nums[k] | l <= k <= r } = nums[r]`
- `isCS(l, r)` — indicator function returning `true` if `[l, r]` is a CS, else `false`
- `prefix(i)` — the subarray `nums[0...i]`
- `leftmostStart(r)` — given index `r`, the leftmost index `l <= r` such that `nums[l] == nums[r]` and `max{ nums[k] | l <= k <= r } = nums[r]`. In other words, the leftmost index from which a CS ending at `r` could potentially start.
- `block(r)` — the interval `[leftmostStart(r), r]`, representing the range of indices where a CS ending at `r` could potentially start. Our solution will maintain metadata about such **expandable blocks** - blocks that may grow as we process further indices.

**Example for `leftmostStart`**: In array `[5, 6, 5, 5]`:
- `leftmostStart(0) = 0`
- `leftmostStart(1) = 1` (the 6 blocks anything before it)
- `leftmostStart(2) = 2` (the 6 at index 1 blocks earlier indices)
- `leftmostStart(3) = 2` (same reason)

---

### Algorithm Schema
We process indices left to right. Each index is treated as a potential **right edge** of a CS. For each index `i`, we want to efficiently count how many valid start indices exist in `block(i)` that satisfy `isCS(l, i) = true`.

To achieve this, we maintain a data structure `startCandidates` that stores relevant information about `prefix(i-1)`, enabling efficient queries for "how many CS end at the current index."

---

### Key Observations

#### Observation I — Eviction policy: remove smaller values before push
Assume our loop is processing index `curr_index` with value `V = nums[curr_index]`. Consider any `prev_index < curr_index` with value `v = nums[prev_index]` where `v < V`.

**Claim**: `prev_index` is no longer useful as a start candidate.

**Reasoning**: There is no interval `[prev_index, i]` with `i >= curr_index` in which `prev_index` holds the maximum value—by definition, `V > v`, so `prev_index` can never be the left boundary of a CS ending at `curr_index` or later.

**Example**: In `[1, 5, 1, 1, ...]`, once we encounter the 5, the leftmost 1 can never be the left edge of a valid subarray, even if more 1s appear later.

This eviction policy - "remove all values strictly smaller than the current before inserting" - will guide our choice of data structure.

#### Observation II — Choosing the optimal data structure for `startCandidates`
According to Observation I, each new insertion nullifies all previously inserted values that are strictly smaller.

**Initial thought — MinHeap**: A natural first candidate is a MinHeap storing pairs `{ value, index }`. This allows finding the smallest value in O(1) and yields O(n log n) total time. This approach is correct.

**Better approach — Descending Stack**: However, we can do better. Due to the specific form of our eviction policy ("remove smallers before push"), we can use a **stack** ordered by descending value (non-ascending, since equal values are allowed). Items with values smaller than the current will appear at the top, so they can be peeked and removed in O(1). This optimizes total time to O(n).

**Example**: Processing array `[5, 6, 5, 5]` with a descending stack (rightmost is top):
- After index 0: `[{ 5, 0 }]`
- After index 1 (evict previous due to smaller value): `[{ 6, 1 }]`
- After index 2 (no eviction needed): `[{ 6, 1 }, { 5, 2 }]`
- After index 3 (no eviction needed): `[{ 6, 1 }, { 5, 2 }, { 5, 3 }]`

#### Observation III — Frequency-based schema (map-reduce optimization)
While the descending stack is optimal, storing `{ value, index }` pairs is not ideal. Whenever we push value `V`, we also need to count how many occurrences of `V` currently exist in `startCandidates` - each such occurrence represents a valid start for a CS ending here.

Some approaches suggest binary search over the stack, but this is over-engineering. A simpler schema is `{ value, frequencyInBlock }`. Think of this as a map-reduce: we "squeeze" all consecutive items with the same value into a single entry.

**Example**: Processing array `[5, 5, 5, 6]`:
- After index 0: `[{ 5, 1 }]` → 1 CS ending here: `[0,0]`
- After index 1: `[{ 5, 2 }]` → 2 CSs ending here: `[0,1]`, `[1,1]`
- After index 2: `[{ 5, 3 }]` → 3 CSs ending here: `[0,2]`, `[1,2]`, `[2,2]`
- After index 3 (eviction first): `[{ 6, 1 }]` → 1 CS ending here: `[3,3]`

In other words, when processing index `i`, we update the frequency of `nums[i]` in `block(i)`. This block can expand in later iterations (with a larger end), or be removed entirely if a strictly larger value is encountered.

---

### Algorithm Outline
1. Initialize `countableSubarrays = n` (all length-1 subarrays are trivially valid).
2. Initialize an empty descending stack `startCandidates` storing `{ value, frequencyInBlock }` pairs. Each pair contains metadata about an **expandable block** — a block that may grow as we process further indices.
3. For each index `i` from `0` to `n-1`:
   - **Evict**: While stack is non-empty and `nums[i] > stack.top().value`, pop the top.
   - **Count and update**:
     - If stack is non-empty and `nums[i] == stack.top().value`: increment `countableSubarrays` by `stack.top().frequencyInBlock`, then increment `stack.top().frequencyInBlock` by 1.
     - Otherwise: push `{ nums[i], 1 }` onto the stack.
4. Return `countableSubarrays`.

---

### Correctness Sketch
- **Observation I** establishes when indices become irrelevant: any index with a smaller value than the current can never form a CS ending at or after the current index.
- **Observation II** shows that the eviction policy naturally fits a descending stack, enabling O(1) evictions.
- **Observation III** introduces the frequency schema, allowing O(1) counting of valid starts without additional searches.
- Together, these observations ensure that for each index `i`, we correctly count all valid CSs ending at `i` by leveraging the frequency of matching values in the current block.

---

### Complexity
- **Time**: `O(n)` — Each element is pushed and popped from the stack at most once.
- **Space**: `O(n)` — In the worst case (strictly descending input), all elements remain in the stack.

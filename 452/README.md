## Proof for LeetCode 452 (Minimum Number of Arrows to Burst Balloons)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given balloon intervals `[xstart, xend]` on the x-axis, an arrow shot at position `x` bursts every balloon with `xstart <= x <= xend`. Find the minimum number of arrows required to burst all balloons.

### Notation
- `n` — number of intervals (balloons)
- `POIC` (Pair-wise Overlapping Intervals Cluster) — a set of intervals where every pair overlaps
- `MOI(p)` — max-overlap-interval of a POIC `p`: the common overlap shared by all intervals in `p`
- `AP(m)` — chosen arrow position for a MOI `m`
- `ascByRight` — intervals sorted by ascending right edge

---

### Key Observations

#### Observation I — MOI formula for a POIC
Let `p = { i(r) | 1 <= r <= k }` be a POIC. Then:

`MOI(p) = [max{ i(u).left | 1 <= u <= k }, min{ i(v).right | 1 <= v <= k }]`

So the overlap spans from the rightmost left edge to the leftmost right edge.

Intuition: each additional interval can only shrink the shared overlap. Its left edge may push MOI's left boundary rightward; its right edge may push MOI's right boundary leftward.

**Example**: `p = [1,9], [2,8], [3,11]`.
- Start with `[1,9]`
- Add `[2,8]` -> shared overlap becomes `[2,8]`
- Add `[3,11]` -> shared overlap becomes `[3,8]`

**Proof by contradiction (boundary form)**:
- Let `L = max{ i(u).left }`. Assume there exists `j < L` with `j in MOI(p)`.
- Pick interval `i(u*)` such that `i(u*).left = L`. Since `j < L`, we have `j < i(u*).left`, so `j` is outside `i(u*)`, contradicting `j in MOI(p)`.
- Symmetrically, let `R = min{ i(v).right }`. Assume `j > R` with `j in MOI(p)`.
- Pick interval `i(v*)` with `i(v*).right = R`. Then `j > i(v*).right`, so `j` is outside `i(v*)`, contradiction.

Hence `MOI(p) = [L, R]`.

#### Observation II — Any point in MOI bursts the whole POIC; choose AP deterministically
Given a POIC `p`, any `x in MOI(p)` overlaps every interval in `p`, so one arrow at `x` bursts all balloons in `p`.

Define a deterministic policy:

`AP(m) = m.right`

where `m = MOI(p)`.

This is without loss of generality (any point in `m` is valid), but choosing `m.right` is computationally convenient: `m.right` equals the minimum right edge among intervals in `p`. This lets us reason using right-edge order, without explicitly recomputing full MOI boundaries per step.

#### Observation III — Minimizing POIC count is equivalent to minimizing arrow count
Suppose we partition all intervals into the minimum number of POICs such that every interval belongs to at least one POIC.

For each POIC `p`, Observation II gives one valid arrow at `AP(MOI(p))`, so any POIC cover of size `k` yields an arrow plan of size `k`.

Conversely, balloons burst by one arrow all share that arrow's x-coordinate, so they form a POIC. Hence every arrow plan corresponds to a POIC cover of the same size.

Therefore minimizing POIC count is equivalent to minimizing arrow count.

#### Observation IV — Sorting by ascending right edge reveals POIC transitions
Assume we process intervals in `ascByRight`.

Let `X` be the current POIC's arrow location, fixed as:

`X = AP(MOI(currentPOIC))`

An interval `i` belongs to the current POIC iff it contains `X`, i.e.:
- `i.left <= X` and `i.right >= X`

Because of ascending-right processing, `X` starts as the first interval's right edge (smallest right among unprocessed intervals). Then:
- If `curr.left <= X`, current interval still overlaps `X` -> implicitly add it to current POIC.
- If `curr.left > X`, current interval cannot overlap the current POIC at `X` -> previous POIC is closed, and a new POIC begins with new `X = curr.right`.

So we do not explicitly build MOIs; we only track POIC transitions via `curr.left > X`.

**Example**: intervals `[1,6], [2,8], [7,12], [10,16]` (already `ascByRight`).
- Start POIC #1 with `X = 6` from `[1,6]`
- `[2,8]`: `2 <= 6` -> same POIC
- `[7,12]`: `7 > 6` -> new POIC #2, set `X = 12`
- `[10,16]`: `10 <= 12` -> same POIC #2

Total POICs (thus arrows) = 2.

#### Observation V — Greedy association to latest discovered POIC is safe
Some intervals may overlap multiple previously discovered POIC choices.

Example: `[5,6], [8,9], [1,10]`.
Interval `[1,10]` overlaps both arrow locations `6` and `9`, so it could be associated with either cluster.

Greedy rule: associate such an interval with the latest discovered (currently formed) POIC.

Why safe: POIC arrow locations discovered in ascending-right order are strictly increasing. If an interval overlaps the latest arrow location, assigning it to that current POIC cannot increase POIC count and cannot invalidate previous closed POICs.

---

### Algorithm Outline
1. Sort intervals by ascending right edge into `ascByRight`.
2. Initialize `arrows = 0`.
3. Traverse `ascByRight` left to right:
   - If this is the first interval, or `curr.left > currentAP`:
     - Start a new POIC.
     - Set `currentAP = curr.right` (deterministic `AP(MOI)` choice).
     - Increment `arrows`.
   - Else (`curr.left <= currentAP`):
     - Keep interval in the currently formed POIC (no new arrow needed).
4. Return `arrows`.

---

### Correctness Sketch
- **Observation I** formalizes MOI boundaries for any POIC.
- **Observation II** shows one arrow at `AP(MOI(p))` bursts all intervals in a POIC.
- **Observation III** establishes equivalence between minimizing arrows and minimizing POIC count.
- **Observation IV** proves that after sorting by right edge, POIC transitions are exactly detected by `curr.left > currentAP`.
- **Observation V** justifies greedy association to the latest discovered POIC when multiple associations are possible.

Together, these observations show that the sweep over `ascByRight` produces the minimum number of POICs, and therefore the minimum number of arrows.

### Complexity
- **Time**: `O(n log n)` — Sorting dominates; sweep is linear.
- **Space**: `O(1)` auxiliary space if sorting in place (or `O(n)` if a sorted copy is used).

## Proof for LeetCode 2271 (Maximum White Tiles Covered by a Carpet)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given a list of disjoint white tile segments `[left, right]` on a number line and a carpet of length `carpetLen`, place the carpet to maximize the number of white tiles it covers. Return that maximum count.

### Context
While this problem is categorized as 'Medium' by users, its success rate is only 35% as of Feb 2026. Despite not being mighty, it does require a few subtle nuances to observe, and is rather tricky to code in a readable manner - which is a separate challenge. I consider it less straightforward than most "2 Pointers" / "Sliding Window" challenges.

### Notation
- `tiles` - array of disjoint tile segments `[left, right]`, sorted ascending by `left`
- `carpetLen` - the carpet's length (number of consecutive positions it covers)
- `length(T)` - the number of white cells in tile `T`, i.e. `T.right - T.left + 1`
- `start` - index of the leftmost tile in the current window
- `end` - exclusive index of the rightmost tile in the current window (i.e., the window contains tiles `[start, end)`)
- `coveredSpanLength` - total span from `tiles[start].left` to `tiles[end-1].right`, i.e. `tiles[end-1].right - tiles[start].left + 1`
- `coveredWhiteCells` - sum of `length(T)` for all tiles `T` in the current window `[start, end)`

---

### Key Observations

#### Observation 1 - An optimal alignment can start at some tile's left edge
**Claim**: There exists an optimal carpet placement whose leftmost position coincides with some tile's left edge.

**Proof**: Suppose an optimal carpet starts at `i`, where `i` is not a tile's left edge. If `i` lies inside a white tile, shift the carpet left one position at a time while its left endpoint remains inside that tile. Each shift gains one white cell on the left and loses at most one white cell on the right, so coverage never decreases. Eventually the carpet starts at that tile's left edge.  
If `i` lies in a gap and there is a tile to its right, shift the carpet right until its left endpoint reaches that tile's left edge. Throughout the shift, every position removed from the carpet's left side lies in the gap, so no white cells are lost, while new white cells may be gained on the right. Therefore coverage cannot decrease.  
If there is no tile to the right, such a placement cannot be optimal, since it covers no white cells.

#### Observation 2 - Candidate cover with partial rightmost tile

**Window invariant** (maintained by Observation 3): The rightmost tile in the window (`tiles[end-1]`) is the only tile that may extend partially or entirely beyond the carpet's reach. The second-to-rightmost tile (`tiles[end-2]`, if it exists) is necessarily fully covered by a carpet placed at `tiles[start].left`. This permits computing the white excess solely from the rightmost tile.

When the carpet starts at `tiles[start].left`, the window `[start, end)` may extend beyond its right edge. If `coveredSpanLength > carpetLen`, some or all of the rightmost tile may lie outside the carpet. Since the carpet ends at `tiles[start].left + carpetLen - 1`, we subtract this **white excess**:

- If `tiles[start].left + carpetLen - 1 < tiles[end-1].left`: the carpet does not reach the rightmost tile at all; the entire rightmost tile is excess.
- Otherwise: the excess is `tiles[end-1].right - (tiles[start].left + carpetLen - 1)` cells.

The candidate cover is then `coveredWhiteCells - whiteExcess`. By the window invariant, no other tile in the window contributes excess, so this subtraction is exact.

#### Observation 3 - Two-pointer window management
Since tiles are sorted and the carpet has fixed length, we can sweep a window `[start, end)` over the tiles using two pointers. Each main-loop iteration performs exactly one of:

- **Expand right**: If `coveredSpanLength < carpetLen` and more tiles exist, increment `end` to include the next tile.
- **Shrink left**: If `coveredSpanLength >= carpetLen` or no more tiles exist to the right, increment `start` to discard the leftmost tile.

Each pointer advances at most `n` times, so the sweep is `O(n)` after sorting.

**Window invariant proof**: We expand the window only when its current span is shorter than `carpetLen`. Therefore, before adding a new tile, every tile already in the window is fully covered. After the expansion, only the newly added rightmost tile can extend beyond the carpet.  
When we shrink from the left, the carpet's left edge moves right, while `end` stays fixed. Thus shrinking cannot cause any previously covered tile on the right to become uncovered. Hence, at any point, only `tiles[end-1]` may lie partially or entirely beyond the carpet.

---

### Algorithm Outline
1. Sort `tiles` in ascending order by `left`. Since tiles are disjoint, sorting by `left` or `right` yields the same order.
2. Initialize `start = 0`, `end = 0`, `coveredWhiteCells = 0`, `maxCovered = 0`.
3. Main loop (while the window can still yield candidates):
   - **Early exit**: If `maxCovered == carpetLen`, return `carpetLen` (full cover found).
   - **Shrink left** (if `coveredSpanLength >= carpetLen` or `end == tiles.length`): Subtract `length(tiles[start])` from `coveredWhiteCells` and increment `start`.
   - **Expand right** (otherwise): Add `length(tiles[end])` to `coveredWhiteCells` and increment `end`.
   - Recompute `coveredSpanLength` and evaluate the candidate cover (accounting for partial rightmost tile per Observation 2). Update `maxCovered` if improved.
4. Return `maxCovered`.

### Correctness Sketch
- **Observation 1** reduces the search space: we only consider placements aligned to a tile's left edge, without loss of optimality.
- **Observation 2** handles the boundary condition where the rightmost tile in the window is only partially covered, ensuring accurate candidate evaluation.
- **Observation 3** guarantees that every valid alignment is evaluated: each tile serves as a window start (via left-pointer advancement), and the right pointer ensures all reachable tiles are included. The two-pointer sweep exhaustively covers all tile-aligned placements in linear time.

Together, these observations ensure the algorithm finds the globally optimal placement.

### Complexity
- **Time**: `O(n log n)` - Dominated by sorting. The two-pointer sweep is `O(n)` since each pointer advances at most `n` times.
- **Space**: `O(n)` - For the sorted copy of the tiles array (or `O(1)` additional space if sorting in-place).

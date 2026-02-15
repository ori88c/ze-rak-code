## Proof for LeetCode 2271 (Maximum White Tiles Covered by a Carpet)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given a list of disjoint white tile segments `[left, right]` on a number line and a carpet of length `carpetLen`, place the carpet to maximize the number of white tiles it covers. Return that maximum count.

### Context
While this problem is categorized as 'Medium' by users, its success rate is only 35% as of Feb 2026. Despite not being mighty, it does require a few subtle nuances to observe, and is rather tricky to code in a readable manner — which is a separate challenge. I consider it less straightforward than most "2 Pointers" / "Sliding Window" challenges.

### Notation
- `tiles` — array of disjoint tile segments `[left, right]`, sorted ascending by `left`
- `carpetLen` — the carpet's length (number of consecutive positions it covers)
- `length(T)` — the number of white cells in tile `T`, i.e. `T.right - T.left + 1`
- `start` — index of the leftmost tile in the current window
- `end` — exclusive index of the rightmost tile in the current window (i.e., the window contains tiles `[start, end)`)
- `coveredSpanLength` — total span from `tiles[start].left` to `tiles[end-1].right`, i.e. `tiles[end-1].right - tiles[start].left + 1`
- `coveredWhiteCells` — sum of `length(T)` for all tiles `T` in the current window `[start, end)`

---

### Key Observations

#### Observation 1 — The optimal alignment must start at some tile's left edge
**Claim**: There exists an optimal carpet placement whose leftmost position coincides with some tile's left edge.

**Proof by contradiction**:

- **Case I — Alignment starts mid-tile**: Assume the optimal carpet alignment starts in the middle of some tile `T`, i.e. `leftmostPosition(carpet) = i` where `T.left < i <= T.right`. Let `D = i - T.left`. Shifting the carpet `D` positions to the left **gains exactly** `D` white tiles on the left side (each step uncovers one more cell of `T`). On the right side, we **lose at most** `D` white tiles — those at positions `[i + carpetLen - D, i + carpetLen - 1]`, which may or may not be white. The net change satisfies `0 <= gain - loss <= D`, so the shifted alignment is at least as good. This contradicts the assumption that the original mid-tile alignment was strictly optimal.

- **Case II — Alignment starts between tiles (gap)**: Assume the optimal carpet alignment starts at position `i` where no tile overlaps `i`. Let `T` be the nearest tile to the right, i.e. the leftmost tile with `T.left > i`. Let `D = T.left - i`. We consider shifting the carpet `D` positions to the right and distinguish two subcases based on the relationship between `carpetLen` and `D`:

  - **Subcase II-a** (`carpetLen >= D`): The carpet is at least as long as the gap. After the shift, the carpet's new range is `[i + D, i + D + carpetLen - 1]`. The old range was `[i, i + carpetLen - 1]`. The new range loses the `D`-length prefix `[i, i + D - 1]`, which contained zero white tiles (it lies in the gap). The new range gains the `D`-length suffix `[i + carpetLen, i + carpetLen + D - 1]`, which contains zero or more white tiles. Therefore the net change is non-negative, and the shifted alignment also gains at least `min(D, length(T))` white tiles from `T` in the new prefix region. The shifted alignment is strictly at least as good.

  - **Subcase II-b** (`carpetLen < D`): The carpet is shorter than the gap. The entire carpet `[i, i + carpetLen - 1]` lies within the gap and covers zero white tiles. Any placement covering at least one white tile is at least as good, so this alignment cannot be uniquely optimal.

  In both subcases, the gap-aligned placement is not strictly optimal, which refutes the contradictory assumption.

In both cases, we can shift the carpet to align with some tile's left edge without decreasing coverage. Therefore, it suffices to consider only alignments starting at a tile's left edge.

#### Observation 2 — Candidate cover with partial rightmost tile
When the carpet is aligned at `tiles[start].left`, the window `[start, end)` may extend beyond the carpet's reach. If `coveredSpanLength > carpetLen`, the rightmost tile is only partially covered. The carpet ends at position `tiles[start].left + carpetLen - 1`, so we must subtract the **white excess** — the portion of the rightmost tile that lies beyond the carpet's end:

- If `tiles[start].left + carpetLen - 1 < tiles[end-1].left`: the carpet does not reach the rightmost tile at all; the entire rightmost tile is excess.
- Otherwise: the excess is `tiles[end-1].right - (tiles[start].left + carpetLen - 1)` cells.

The candidate cover is then `coveredWhiteCells - whiteExcess`.

#### Observation 3 — Two-pointer window management
Since tiles are sorted and the carpet has fixed length, we can sweep a window `[start, end)` over the tiles using two pointers. Each main-loop iteration performs exactly one of:

- **Expand right**: If `coveredSpanLength < carpetLen` and more tiles exist, increment `end` to include the next tile.
- **Shrink left**: If `coveredSpanLength >= carpetLen` or no more tiles exist to the right, increment `start` to discard the leftmost tile.

This ensures every tile is considered as both a potential window start and a potential window end, and each pointer advances at most `n` times total.

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
- **Time**: `O(n log n)` — Dominated by sorting. The two-pointer sweep is `O(n)` since each pointer advances at most `n` times.
- **Space**: `O(n)` — For the sorted copy of the tiles array (or `O(1)` additional space if sorting in-place).

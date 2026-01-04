## Proof for LeetCode 1975 (Maximum Matrix Sum)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given an `n × n` integer matrix, you can apply an operation any number of times: select two adjacent cells and negate both their values. Maximize the total sum of all matrix elements.

Notice that it is not necessary to find the minimum number of operations required to maximize the sum; this is a much more difficult question and out of scope. 

### Notation
- `n` — matrix dimension (n × n)  
- `MAV` — minimum absolute value cell across the entire matrix  
- `negCount` — count of negative-valued cells in the initial matrix

### Key Observations
#### Observation 1 — Any pair of negatives can be eliminated
Consider two negative-valued cells `c1 = [x1, y1]` and `c2 = [x2, y2]`. Without loss of generality, assume `x1 ≤ x2` and `y1 ≤ y2`, meaning `c2` is located to the right of and above `c1` (the same process applies to the other three spatial configurations).

We can "push" the negative sign from `c1` to `c2` along an L-shaped path:
- **Push Right:** Apply the operation on adjacent cells `[x1, y1]` and `[x1+1, y1]`, then on `[x1+1, y1]` and `[x1+2, y1]`, continuing until the final operation on `[x2-1, y1]` and `[x2, y1]`. After this horizontal sequence, cell `[x2, y1]` has flipped its sign, while `[x1, y1]` is now positive.
- **Push Up:** Apply the operation on adjacent cells `[x2, y1]` and `[x2, y1+1]`, then on `[x2, y1+1]` and `[x2, y1+2]`, continuing until the final operation on `[x2, y2-1]` and `[x2, y2]`. After this vertical sequence, cell `[x2, y2]` has also flipped its sign.

Crucially, all intermediate cells along this L-path retain their original signs: each intermediate cell is flipped exactly twice (once when entering, once when exiting the propagation sequence), while only the endpoints `c1` and `c2` are flipped once. The net effect: both `c1` and `c2` have become positive, and no other cells are affected. This L-path approach works for any pair of negatives, regardless of their relative positions.

#### Observation 2 — Even count of negatives yields all-positive solution
When `negCount` is even, arbitrarily partition the negative cells into pairs: `[c1, c2]`, `[c3, c4]`, ... and apply Observation 1 to each pair. Since the problem does not require minimizing the number of operations, any pairing assignment works—each pair can independently eliminate its negatives. The resulting maximum sum is `sum{ |cell| : cell in matrix }`.

#### Observation 3 — Odd count leaves exactly one negative, optimally placed at MAV
Suppose `negCount = 2K + 1`. Select any `2K` of these negatives and apply Observation 2 to make them all positive, leaving exactly one negative cell `C`.

By definition, each operation negates two adjacent cells. If we negate a positive cell adjacent to `C`, we "propagate" the negative sign to that neighbor. Crucially, we cannot eliminate this last negative entirely—at least one cell must remain negative (unless there's a zero value cell in the matrix, an edge case). To maximize the total sum, we want this unavoidable negative to correspond to the smallest absolute value in the matrix, `MAV`.

Using the same L-path technique from Observation 1, treat `c1 = C` and `c2 = MAV`, and propagate the negativeness from `C` to `MAV`. The maximum sum becomes:

`sum{ |cell| : cell in matrix except MAV } - |MAV|`

which equals:

`sum{ |cell| : cell in matrix } - 2 * |MAV|`

The second formula is computationally convenient: compute the total absolute sum and `MAV` in one pass, then apply the correction.

### Algorithm Outline
1. Initialize `totalAbsSum = 0`, `negCount = 0`, and `MAV = ∞`.  
2. Traverse the entire `n × n` matrix:
   - For each cell, add `|cell|` to `totalAbsSum`.
   - If `cell < 0`, increment `negCount`.
   - Update `MAV = min(MAV, |cell|)`.
3. Determine the result:
   - If `negCount` is **even**, return `totalAbsSum` (all negatives can be eliminated).
   - If `negCount` is **odd**, return `totalAbsSum - 2 * MAV` (one negative remains, optimally at `MAV`).

### Correctness Sketch
- Observation 1 establishes that any pair of negatives can be converted to positives via an L-path sequence of operations, regardless of their positions in the matrix.
- Observation 2 extends this to show that an even count of negatives can be fully eliminated through arbitrary pairings, yielding the maximum possible sum of absolute values.
- Observation 3 proves that an odd count forces exactly one negative to persist. The operation-propagation mechanism allows us to move this negative to any cell, so choosing `MAV` minimizes the penalty, producing the formula `totalAbsSum - 2 * MAV`.
- Together, these observations ensure the algorithm achieves the globally optimal sum.

### Complexity
- Time: `O(n²)` — single traversal of the n × n matrix to compute `totalAbsSum`, `negCount`, and `MAV`.
- Space: `O(1)` — constant auxiliary space.

### Why No Code Attached
The coding part of this problem is too basic to focus on. The substantial part, which is usually overlooked, is the proof.



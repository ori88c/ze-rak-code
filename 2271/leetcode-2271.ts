/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 *
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 *
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

/**
 * Represents a contiguous segment [left, right] of white tiles on a number line.
 */
interface Tile {
  left: number;
  right: number;
}

/**
 * Ascending-by-left comparer defined once (improves readability and avoids
 * recreating the comparer per call).
 * Since tiles are disjoint, sorting by left or right yields the same order.
 */
const ascByLeftComparer = (
  t1: Readonly<Tile>,
  t2: Readonly<Tile>
): number => (t1.left - t2.left);

/**
 * LeetCode 2271: Maximum White Tiles Covered by a Carpet
 *
 * Given disjoint tile segments on a number line and a carpet of fixed length,
 * finds the maximum number of white tiles coverable by a single carpet placement.
 *
 * - Full proof and detailed reasoning: see 2271/README.md
 * - Proof outline (short):
 *   1) Optimal alignment starts at some tile's left edge (proof by contradiction, two cases).
 *   2) Two-pointer window sweeps potential placements; each iteration expands right or shrinks left.
 *   3) Candidate cover accounts for partial rightmost tile when the window span exceeds carpetLen.
 *   4) Each pointer advances at most n times, yielding O(n) sweep after O(n log n) sort.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 * 
 * ### Complexity
 * Time Complexity: O(n log n) - Dominated by sorting; the two-pointer sweep is O(n).
 * Space Complexity: O(n) - For the sorted copy of the tiles array.
 *
 * @param tiles     - Disjoint tile segments [left, right]
 * @param carpetLen - Length of the carpet
 * @returns Maximum number of white tiles coverable
 */
export function findMaxCoverableTiles(
  tiles: readonly Readonly<Tile>[],
  carpetLen: number
): number {
  if (tiles.length === 0) return 0;

  const sortedTiles = tiles.toSorted(ascByLeftComparer);
  const n = sortedTiles.length;

  const tileLength = (tile: Readonly<Tile>): number =>
    tile.right - tile.left + 1;

  let coveredWhiteCells = 0;
  let coveredSpanLength = 0;
  let start = 0;
  let end = 0; // Exclusive: current window covers tiles [start, end).
  let maxCovered = 0;

  /**
   * When the window span exceeds carpetLen, the rightmost tile may extend
   * partially or entirely beyond the carpet's reach. Subtracts that excess
   * to yield the actual covered count.
   */
  const calculateCandidateCover = (): number => {
    if (coveredSpanLength <= carpetLen) return coveredWhiteCells;

    const leftTile = sortedTiles[start];
    const rightTile = sortedTiles[end - 1];
    const carpetEndInclusive = leftTile.left + carpetLen - 1;

    // The rightmost tile may be partially or fully beyond the carpet's reach.
    const whiteExcess = carpetEndInclusive < rightTile.left
      ? tileLength(rightTile) // Carpet does not reach the rightmost tile at all.
      : (rightTile.right - carpetEndInclusive);

    return coveredWhiteCells - whiteExcess;
  };

  // Two-pointer sweep: each iteration either expands right or shrinks left,
  // never both. By Observation 1, it suffices to consider alignments starting
  // at sortedTiles[start].left.
  do {
    // Full cover found; no further iteration can improve the result.
    if (maxCovered === carpetLen) return carpetLen;

    if (coveredSpanLength >= carpetLen || end === n) {
      // Window spans at least carpetLen, or no more tiles to include.
      // Shrink from the left.
      coveredWhiteCells -= tileLength(sortedTiles[start++]);
    } else {
      // Expand the window rightward.
      coveredWhiteCells += tileLength(sortedTiles[end++]);
    }

    // Evaluate the candidate cover for the current window.
    coveredSpanLength =
      sortedTiles[end - 1].right - sortedTiles[start].left + 1;

    maxCovered = Math.max(maxCovered, calculateCandidateCover());
  } while (
    end < n ||
    (start < end && coveredSpanLength > carpetLen)
  );

  return maxCovered;
}

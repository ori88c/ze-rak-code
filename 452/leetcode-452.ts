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
 * [start, end] denotes a balloon whose horizontal diameter stretches between x-coordinate
 * start and x-coordinate end.
 */
export interface BalloonInterval {
  start: number;
  end: number;
}

/**
 * Ascending-by-right comparer defined once (improves readability and avoids
 * recreating the comparer per call).
 */
const ascByRightComparer = (
  a: Readonly<BalloonInterval>,
  b: Readonly<BalloonInterval>
): number => (a.end - b.end);

/**
 * LeetCode 452: Minimum Number of Arrows to Burst Balloons
 *
 * Given balloon intervals on the x-axis, returns the minimum number of arrows
 * needed to burst all balloons, where one arrow at position x bursts every
 * interval containing x.
 *
 * - Full proof and detailed reasoning: see 452/README.md
 * - Proof outline (short):
 *   1) Intervals are grouped into POICs (pair-wise overlapping clusters).
 *   2) One arrow at AP(MOI(p)) bursts all intervals in a POIC.
 *   3) Sorting by right edge allows deterministic AP choice: currentAP = curr.end
 *      when a new POIC starts.
 *   4) During the sweep, curr.start > currentAP means current POIC ended and a
 *      new POIC begins, so arrows increment exactly at POIC transitions.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n log n) - Sorting dominates; sweep is O(n).
 * - Space: O(n) - For the sorted copy created by toSorted.
 *
 * @param intervals - Balloon intervals [start, end]
 * @returns Minimum number of arrows required to burst all balloons
 */
export function findMinArrowShots(
  intervals: readonly Readonly<BalloonInterval>[]
): number {
  if (intervals.length === 0) return 0;

  const ascByRight = [...intervals].sort(ascByRightComparer);
  let arrowCount = 1;
  let currentArrowPosition = ascByRight[0].end;

  for (const curr of ascByRight) {
    const { start, end } = curr;
    if (start > currentArrowPosition) {
      // New POIC discovered: previous arrow cannot burst this interval.
      ++arrowCount;
      currentArrowPosition = end;
    } // Else, the current arrow can still burst the current interval.
  }

  return arrowCount;
}

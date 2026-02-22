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
 * Represents an array element paired with its original index,
 * used after sorting by value to retain positional information.
 */
interface ArrayItem {
  value: number;
  originalIndex: number;
}

/**
 * Ascending-by-value comparer defined once (improves readability and avoids
 * recreating the comparer per call).
 */
const ascByValueComparer = (
  a: Readonly<ArrayItem>,
  b: Readonly<ArrayItem>
): number => (a.value - b.value);

/**
 * LeetCode 2659: Make Array Empty
 *
 * Given an array of distinct integers, counts the total number of operations
 * needed to empty the array by repeatedly removing the current minimum from
 * the front, or moving the front element to the end.
 *
 * - Full proof and detailed reasoning: see 2659/README.md
 * - Proof outline (short):
 *   1) Each full pass costs exactly |remaining| operations (both removal and
 *      move-to-end advance the pointer equally).
 *   2) Remaining elements after any pass maintain ascending original indices.
 *   3) Elements removable per pass form the LMAAS (Longest Minimum-Anchored
 *      Ascending Subsequence) in the remaining-items array state at the
 *      beginning of the pass, before traversal starts.
 *   4) Sorting by value upfront and sweeping with a single pointer detects
 *      when the current pass ends and the next pass begins, in O(n) total,
 *      via index-monotonicity breaks.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n log n) — Dominated by sorting. The main-loop sweep is O(n).
 * - Space: O(n) — For the sorted ascItems array.
 *
 * @param nums - Input array of distinct integers
 * @returns Total number of operations to empty the array
 */
export function countOperationsToEmptyArray(nums: readonly number[]): number {
  const n = nums.length;
  if (n === 0) return 0;

  const ascItems: readonly Readonly<ArrayItem>[] = nums
    .map((value, originalIndex): ArrayItem => ({ value, originalIndex }))
    .sort(ascByValueComparer);

  let totalOperations = 0;
  let ascIndex = 0;

  do {
    // Each full pass traverses all remaining elements (Observation 1).
    const remainingCount = n - ascIndex;
    totalOperations += remainingCount;

    // Advance through one pass's LMAAS (Observation 3). In ascItems view, this
    // is exactly the contiguous prefix of the still-unprocessed suffix whose
    // original indices stay ascending. A break marks the next pass.
    let prevOriginalIndex = -1;
    while (ascIndex < n && ascItems[ascIndex].originalIndex > prevOriginalIndex) {
      prevOriginalIndex = ascItems[ascIndex].originalIndex;
      ++ascIndex;
    }
  } while (ascIndex < n);

  return totalOperations;
}

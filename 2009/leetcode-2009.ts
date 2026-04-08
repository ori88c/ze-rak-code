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
 * Ascending numeric comparer defined once (improves readability and avoids
 * recreating the comparer per call).
 */
const ascNumericComparer = (a: number, b: number): number => (a - b);

/**
 * LeetCode 2009: Minimum Number of Operations to Make Array Continuous
 *
 * Given an integer array, returns the minimum number of replace operations
 * needed to make it continuous (all elements unique, max - min == length - 1).
 *
 * - Full proof and detailed reasoning: see 2009/README.md
 * - Proof outline (short):
 *   1) Duplicates must be replaced regardless; deduplicate and sort nums into
 *      ascUniqueNums. The answer is n - maxUnchangedCount (Observation 1).
 *   2) Any two unchanged values must differ by at most maxValidDiff = n - 1;
 *      a larger gap would require more than n distinct integers (Observation 2).
 *   3) An optimal range can always be anchored at an existing value; each anchor
 *      defines a contiguous window over ascUniqueNums (Observation 3).
 *   4) The right boundary is monotonically non-decreasing as the anchor advances,
 *      enabling an O(m) two-pointer sweep after O(n log n) sorting (Observation 4).
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n log n) — Dominated by sorting. The two-pointer sweep is O(m) ⊆ O(n).
 * - Space: O(m) ⊆ O(n) — For the ascUniqueNums array.
 *
 * @param nums - Input integer array
 * @returns Minimum number of replace operations to make nums continuous
 */
export function minOperationsToMakeContinuous(nums: readonly number[]): number {
  const n = nums.length;
  if (n <= 1) return 0;

  const maxValidDiff = n - 1;
  const ascUniqueNums = Array.from(new Set(nums)).toSorted(ascNumericComparer);
  const m = ascUniqueNums.length;

  let maxUnchangedCount = 0;
  let endExclusive = 0;

  for (let anchorIndex = 0; anchorIndex < m; ++anchorIndex) {
    // Expand right: include all values within the valid range for this anchor.
    while (
      endExclusive < m &&
      ascUniqueNums[endExclusive] - ascUniqueNums[anchorIndex] <= maxValidDiff
    ) {
      ++endExclusive;
    }

    maxUnchangedCount = Math.max(maxUnchangedCount, endExclusive - anchorIndex);

    // Advancing the anchor can only shrink the window, so no later iteration can
    // improve the result further.
    if (endExclusive === m) break;
  }

  return n - maxUnchangedCount;
}

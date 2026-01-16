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
 * Represents an expandable block in the descending stack.
 * Each block tracks a value and how many times it appears within the block's range
 * (without being interrupted by a strictly larger value).
 * 
 * Note: the matching indices within a block are not necessarily consecutive.
 * For example, in array [5, 4, 5, 4] the block for value 5 covers range [0, 2],
 * but the actual start-candidates are indices 0 and 2 only (not index 1).
 */
interface ExpandableBlock {
  value: number;
  frequencyInBlock: number;
}

/**
 * LeetCode 3113: Find the Number of Subarrays Where Boundary Elements Are Maximum
 *
 * Counts subarrays [l, r] where nums[l] == nums[r] and this boundary value
 * equals the maximum element in the subarray.
 *
 * - Full proof and detailed reasoning: see 3113/README.md
 * - Proof outline (short):
 *   1) Process indices left to right; each index is a potential right edge of a countable subarray.
 *   2) Eviction policy: values strictly smaller than the current become irrelevant as start candidates.
 *   3) This eviction pattern fits a descending stack (non-ascending by value).
 *   4) Frequency-based schema: store { value, frequencyInBlock } to count matching starts in O(1).
 *   5) Each element is pushed/popped at most once, yielding O(n) time.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n) — Each element is pushed and popped at most once.
 * - Space: O(n) — In the worst case (strictly descending input), all elements remain in the stack.
 *
 * @param nums - Input array of integers
 * @returns Number of countable subarrays
 */
export function countSubarrays(nums: readonly number[]): number {
  const n = nums.length;
  if (n === 0) return 0;

  // All length-1 subarrays are trivially valid.
  let countableSubarrays = n;

  // Descending stack (non-ascending by value). Array simulates a stack; access top via .at(-1).
  const startCandidatesStack: ExpandableBlock[] = [];

  for (const currValue of nums) {
    // Evict: values strictly smaller than currValue can never be the left boundary
    // of a countable subarray ending here or later.
    while (
      startCandidatesStack.length !== 0 &&
      currValue > startCandidatesStack.at(-1)!.value
    ) {
      startCandidatesStack.pop();
    }

    // Count and update.
    const topBlock = startCandidatesStack.at(-1);
    if (topBlock !== undefined && currValue === topBlock.value) {
      // Each previous occurrence in the current block can be the start of a
      // countable subarray ending here.
      countableSubarrays += topBlock.frequencyInBlock;
      ++topBlock.frequencyInBlock;
    } else {
      // This value starts a fresh expandable block.
      const newBlock: ExpandableBlock = { value: currValue, frequencyInBlock: 1 };
      startCandidatesStack.push(newBlock);
    }
  }

  return countableSubarrays;
}

/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 * 
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 * 
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

import { SlimQueue } from 'data-oriented-slim-queue';

/**
 * Represents a scheduled fix to stop counting a decrement contribution
 * when the sliding window moves beyond a certain index.
 * 
 * Referenced in README.md Observation 6.
 */
interface IncrementalDecrementFix {
  increaseBy: number; // Amount to subtract from accumulated_decrement
  fromIndex: number;  // Index where this fix applies (i+k for operation starting at i)
}

/**
 * LeetCode 2772: Apply Operations to Make All Array Elements Equal to Zero
 * 
 * Determines if all array elements can be made zero by repeatedly applying
 * the operation: decrement all elements in a subarray [i, i+k) by 1.
 * 
 * - Full proof and detailed reasoning: see 2772/README.md
 * - Proof outline (short):
 *   1) Leftmost positive must be processed first: op(i, V) is mandatory (proof by elimination).
 *   2) Exact operation count required: applying V operations at index i with value V.
 *   3) Post-operation validation: if any element becomes negative, no solution exists.
 *   4) Optimization: instead of O(nk) physical decrements, maintain accumulated_decrement.
 *   5) Queue-based fixes: schedule removal of decrement contributions at index i+k.
 *   6) Monotonic ordering: fixes occur in increasing index order, so queue (not priority queue) suffices.
 * 
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 * 
 * @param nums - Input array of integers
 * @param k - Operation window size
 * @returns true if all elements can be made zero, false otherwise
 * 
 * Time Complexity: O(n) - Single pass with O(1) queue operations per element
 * Space Complexity: O(k) - At most k pending fixes in the queue
 */
export function canZeroAllElements(nums: readonly number[], k: number): boolean {
  const n = nums.length;
  
  // Initialize the queue with optimal capacity to avoid reallocations.
  // Maximum queue size is k (operations within a k-length sliding window).
  const fixesQueue = new SlimQueue<IncrementalDecrementFix>(k);
  
  // Tracks the cumulative decrement applied to the current index from all
  // previous operations within the sliding window.
  let accumulatedDecrement = 0;
  
  for (let i = 0; i < n; ++i) {
    // Apply scheduled fix if one exists for the current index.
    // Referenced in README.md Observation 6: fixes occur in monotonically
    // increasing index order, so the earliest fix is always at the front.
    if (!fixesQueue.isEmpty && fixesQueue.firstIn.fromIndex === i) {
      accumulatedDecrement -= fixesQueue.firstIn.increaseBy;
      fixesQueue.pop();
    }
    
    // Calculate the effective value at index i after applying all operations
    // from indices [i-k+1, i). This is the "current value" considering all
    // decrements scheduled by previous operations.
    const effectiveValue = nums[i] - accumulatedDecrement;
    
    // Validation: Previous mandatory operations caused negativity.
    if (effectiveValue < 0) {
      return false;
    }

    // No operation needed at this index if already zero.
    if (effectiveValue === 0) {
      continue;
    }
    
    // The effective value is positive. By README.md Observation 1 (leftmost positive
    // must be processed first), we MUST apply op(i, effectiveValue) to zero it out.
    
    // First, verify that index i can actually start a k-length window.
    // We need indices [i, i+k) to exist.
    const windowExclusiveEnd = i + k;
    if (windowExclusiveEnd > n) {
      return false;  // Cannot complete the required operation at index i
    }
    
    // Apply op(i, effectiveValue): conceptually decrement all elements in [i, i+k)
    // by effectiveValue. Instead of physically modifying future elements, we:
    // 1. Increase accumulated_decrement to affect indices [i, i+k)
    // 2. Schedule a fix at index windowExclusiveEnd to stop counting this decrement
    //    for indices beyond the window
    accumulatedDecrement += effectiveValue;
    fixesQueue.push({
      increaseBy: effectiveValue,
      fromIndex: windowExclusiveEnd
    });
  }
  
  // All elements successfully zeroed.
  return true;
}

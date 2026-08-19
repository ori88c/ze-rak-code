/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 *
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 *
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

const MODULO = 1_000_000_007n;

/**
 * Descending numeric comparer defined once for readability and to avoid
 * recreating the comparer per call.
 */
const descNumberComparer = (a: number, b: number): number => (b - a);

/**
 * LeetCode 1648: Sell Diminishing-Valued Colored Balls
 *
 * Given the inventory quantity of each color and a number of orders, returns
 * the maximum profit obtainable by selling exactly that many balls.
 *
 * - Full proof and detailed reasoning: see 1648/README.md
 * - Proof outline (short):
 *   1) For a color with quantity q, its possible sale prices are
 *      q, q-1, ..., 1. Therefore, the optimal result is the prefix sum of the
 *      largest `orders` values across all such sequences (`DESC_PRICES`).
 *   2) At price v, the corresponding block in `DESC_PRICES` contains exactly
 *      the colors whose inventory is >= v; therefore block lengths only grow
 *      as the price decreases (Observations 1-2).
 *   3) After sorting inventory descending, every active prefix of length
 *      `blockLength` identifies a whole range
 *      `(nextLevel, currLevel]` whose price blocks all have that same length
 *      (Observation 3).
 *   4) The entire range can therefore be consumed in O(1) using an arithmetic
 *      series. If the requested prefix ends inside the range, consume its full
 *      levels first and then the required part of the next level
 *      (Observations 4-5).
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n log n) - Dominated by sorting. The main-loop sweep is O(n).
 * - Space: O(n) - For the sorted `descInventory` copy.
 *
 * @param inventory - Number of balls available for each color
 * @param orders - Number of balls to sell
 * @returns Maximum obtainable profit modulo 1,000,000,007
 */
export function maxProfit(
  inventory: readonly number[],
  orders: number,
): number {
  const n = inventory.length;
  if (n === 0 || orders === 0) return 0;

  const descInventory: readonly number[] = [...inventory].sort(descNumberComparer);

  let remainingOrders = BigInt(orders);
  let profit = 0n;

  for (
    let blockLength = 1;
    blockLength <= n && remainingOrders > 0n;
    ++blockLength
  ) {
    const currLevel = BigInt(descInventory[blockLength - 1]);
    const nextLevel = BigInt(
      blockLength < n ? descInventory[blockLength] : 0,
    );

    // A non-active prefix corresponds to no price level (Observation 3).
    const levelCount = currLevel - nextLevel;
    if (levelCount === 0n) continue;

    const blockLengthBigInt = BigInt(blockLength);
    const ordersForWholeRange = blockLengthBigInt * levelCount;

    if (remainingOrders >= ordersForWholeRange) {
      // Consume all equal-length blocks in this range at once (Observation 4).
      profit +=
        blockLengthBigInt *
        sumInclusive(nextLevel + 1n, currLevel);

      remainingOrders -= ordersForWholeRange;
      continue;
    }

    // The DESC_PRICES prefix ends inside this range (Observation 5).
    const completeLevels = remainingOrders / blockLengthBigInt;
    const colorsAtPartialLevel = remainingOrders % blockLengthBigInt;

    const lowestCompleteLevel = currLevel - completeLevels + 1n;

    profit += blockLengthBigInt * sumInclusive(lowestCompleteLevel, currLevel);
    profit += colorsAtPartialLevel * (lowestCompleteLevel - 1n);

    remainingOrders = 0n;
  }

  if (remainingOrders > 0n) {
    throw new Error("Insufficient inventory to fulfill all orders");
  }

  return Number(profit % MODULO);
}

/**
 * Returns the arithmetic-series sum:
 *
 *   first + (first + 1) + ... + lastInclusive
 *
 * Runs in O(1).
 */
function sumInclusive(
  first: bigint,
  lastInclusive: bigint,
): bigint {
  if (first > lastInclusive) return 0n;

  return (
    lastInclusive * (lastInclusive + 1n) -
    (first - 1n) * first
  ) / 2n;
}

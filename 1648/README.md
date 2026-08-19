## Proof for LeetCode 1648 (Sell Diminishing-Valued Colored Balls)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Table of Contents

- [Problem (brief)](#problem-brief)
- [Brute Force - Laying the Foundation & Terminology Before Optimizing](#brute-force)
  - [Observation 1 - `DESC_PRICES` Is a Concatenation of Equal-Value Blocks](#observation-1)
  - [Observation 2 - Block Lengths Are Monotonically Non-Decreasing](#observation-2)
- [Optimized `O(|colors| * log|colors|)` Solution](#optimized-solution)
  - [Observation 3 - Active Prefixes Define Ranges of Equal-Length Blocks](#observation-3)
  - [Example - `descInventory = [15,15,1]`](#example)
  - [Observation 4 - All Blocks of the Same Length Can Be Processed at Once](#observation-4)
  - [Observation 5 - The Final Range May Be Only Partially Consumed](#observation-5)
- [Algorithm Outline](#algorithm)
- [Correctness](#correctness)
- [Complexity](#complexity)

---

<a id="problem-brief"></a>

### Problem (brief)

We are given an `inventory` array, where `inventory[i]` is the number of balls of color `i`.

When selling a ball of some color, its value is the **current quantity** of that color. Therefore, if a color initially contains `q` balls, selling all of them produces the values:

`q, q-1, q-2, ..., 1`

Sell `orders` balls for the maximum possible profit.

---

<a id="brute-force"></a>

### Brute Force - Laying the Foundation & Terminology Before Optimizing

Before introducing the optimized solution, it is useful to describe a brute-force formulation. The optimized solution will effectively simulate this formulation without explicitly constructing it.

Colors are normally denoted by indices, but for readability we may occasionally refer to them as `A`, `B`, etc.

For every color containing `q` balls, create its complete sequence of possible sale prices: `[q, q-1, ..., 1]`. Concatenating these sequences for all colors forms an imaginary array `PRICES` of length: `inventorySum = sum(inventory[i])`. For example:
```text
inventory = [3,3,1]

PRICES = [3,2,1, 3,2,1, 1]
```

The three subsequences correspond to the three colors. Now sort all prices in descending order: `DESC_PRICES = [3,3,2,2,1,1,1]`. The optimal profit is the sum of the first `orders` elements of `DESC_PRICES`. Why is this selection valid?

Suppose we select a price `r` belonging to some color whose initial quantity was `q`, where `r < q`. Selling that color at price `r` requires first selling it at prices: `q, q-1, ..., r+1`. All of those values are larger than `r`, so they appear earlier in `DESC_PRICES` and are therefore already included before reaching `r`.

If the prefix ends in the middle of a block of equal prices, we may choose any required subset of the colors represented by that block; all prerequisite higher-priced sales for those colors have already occurred.

Therefore, the prefix `DESC_PRICES[0, orders)` is both:  
* the largest possible sum of `orders` values, and
* a feasible sequence of sales under the pricing rule.

Thus the problem **reduces to efficiently computing that prefix sum without constructing `DESC_PRICES`**.

<a id="observation-1"></a>

#### Observation 1 - `DESC_PRICES` Is a Concatenation of Equal-Value Blocks

Consider again:  
```text
inventory = [3,3,1]

DESC_PRICES = [3,3,2,2,1,1,1]
```

It consists of the blocks:
```text
[3,3]
[2,2]
[1,1,1]
```

For any price `v`, a color contributes exactly one occurrence of `v` if and only if its initial inventory is at least `v`.

Therefore:  
```text
lengthOfBlock(v) = number of colors with inventory[i] >= v
```

A single color can never contribute twice to the same block, because its sale prices are strictly decreasing.

<a id="observation-2"></a>

#### Observation 2 - Block Lengths Are Monotonically Non-Decreasing

As the price decreases, blocks can only stay the same length or become longer. Formally, if a color contributes a sale at price `v`, then its initial quantity is at least `v`, so it must also contribute a sale at price `v-1`. This yields `lengthOfBlock(v-1) >= lengthOfBlock(v)`.

A block becomes strictly longer precisely when lowering the price introduces one or more colors whose **initial inventory equals the new price**. For example:
```text
inventory = [3,2,1]

DESC_PRICES = [3,2,2,1,1,1]
```

The block lengths are:
```text
price 3 -> length 1
price 2 -> length 2
price 1 -> length 3
```
This monotonicity is the key property that allows `DESC_PRICES` to be reconstructed from the sorted inventory.

---

<a id="optimized-solution"></a>

### Optimized `O(|colors| * log|colors|)` Solution

Let `descInventory = inventory sorted in descending order`. For example:
```text
inventory     = [1,3,3]
descInventory = [3,3,1]
```

We traverse `descInventory` from left to right.

The important idea is that we do **not** simulate individual sales and we do **not** explicitly decrease inventory quantities. Instead, the sorted inventory tells us exactly where the length of the blocks in `DESC_PRICES` changes.

<a id="observation-3"></a>

#### Observation 3 - Active Prefixes Define Ranges of Equal-Length Blocks

Consider a prefix of length `blockLength`. Define:

```text
currLevel = descInventory[blockLength - 1]

nextLevel =
    descInventory[blockLength], if such an element exists
    0, otherwise
```

The prefix is **active** when `currLevel > nextLevel`. In that case, it corresponds to the non-empty range of price levels:

```text
currLevel,
currLevel - 1,
...,
nextLevel + 1
```

For every price `v` in this range, **exactly `blockLength` colors can be sold at price `v`.**

Why?

Because `descInventory` is sorted:

```text
descInventory[0 .. blockLength-1] >= v
```

while:

```text
descInventory[blockLength .. n-1] < v
```

Therefore, exactly the first `blockLength` colors contribute a copy of `v` to `DESC_PRICES`, so the block corresponding to price `v` has length `blockLength`.

Hence all price levels in the range:

```text
nextLevel < v <= currLevel
```

correspond to blocks of the same length.

The number of such levels is:

```text
levelCount = currLevel - nextLevel
```

If `currLevel == nextLevel`, then `levelCount == 0`. The prefix is not active: no price level produces a block of exactly this `blockLength`, so this prefix length can simply be skipped.

<a id="example"></a>

#### Example - `descInventory = [15,15,1]`

Consider:

```text
descInventory = [15,15,1]
```

For `blockLength = 1`:

```text
currLevel = 15
nextLevel = 15
levelCount = 0
```

There are no blocks of length `1`.

For `blockLength = 2`:

```text
currLevel = 15
nextLevel = 1
levelCount = 14
```

Thus prices:

```text
15, 14, 13, ..., 2
```

each occur exactly twice in `DESC_PRICES`.

Conceptually:

```text
[15,15]
[14,14]
[13,13]
...
[2,2]
```

For `blockLength = 3`:

```text
currLevel = 1
nextLevel = 0
levelCount = 1
```

The final block is:

```text
[1,1,1]
```

Thus, by traversing only the three entries of `descInventory`, we have **implicitly described** every block of `DESC_PRICES`.

<a id="observation-4"></a>

#### Observation 4 - All Blocks of the Same Length Can Be Processed at Once

For a given `blockLength`, the relevant price levels are:

```text
currLevel, currLevel-1, ..., nextLevel+1
```

There are:

```text
levelCount = currLevel - nextLevel
```

such levels, and every level contains exactly `blockLength` prices.

Therefore the number of orders represented by the whole range is:

```text
ordersForWholeRange = blockLength * levelCount
```

Its total profit is:

```text
blockLength * sumInclusive(nextLevel + 1, currLevel)
```

where:

```text
sumInclusive(first, last) = first + (first+1) + ... + last
```

and can be calculated in `O(1)` using the arithmetic-series formula:

```text
sumInclusive(first, last) = last * (last + 1) / 2 - (first - 1) * first / 2
```

For example, with:

```text
descInventory = [15,15,1]
blockLength = 2
```

we process all 14 blocks at once:

```text
2 * sumInclusive(2, 15)
```

instead of individually processing:

```text
[15,15], [14,14], ..., [2,2]
```

This is the main optimization.

The number of distinct price levels may be extremely large, but the number of blocks (Active Prefixes) is at most the number of colors.

<a id="observation-5"></a>

#### Observation 5 - The Final Range May Be Only Partially Consumed

Suppose there are fewer remaining orders than:

```text
ordersForWholeRange
```

Then the answer ends somewhere inside the current range of equal-length blocks.

Let:

```text
remainingOrders = R
```

Each complete price level consumes exactly `blockLength` orders, so:

```text
completeLevels = floor(R / blockLength)
```

and:

```text
colorsAtPartialLevel = R % blockLength
```

The fully consumed levels are the highest `completeLevels` prices:

```text
currLevel,
currLevel - 1,
...,
currLevel - completeLevels + 1
```

Define:

```text
lowestCompleteLevel = currLevel - completeLevels + 1
```

Their contribution is:

```text
blockLength * sumInclusive(lowestCompleteLevel, currLevel)
```

If some orders remain, they all have the next price:

```text
currLevel - completeLevels
```

which is equivalently:

```text
lowestCompleteLevel - 1
```

Therefore the partial block contributes:

```text
colorsAtPartialLevel * (lowestCompleteLevel - 1)
```

At that point all `orders` have been fulfilled, so the traversal terminates.

---

<a id="algorithm"></a>

### Algorithm Outline

1. Sort `inventory` in descending order into `descInventory`.
2. Initialize `remainingOrders = orders` and `profit = 0`.
3. Traverse prefix lengths `blockLength = 1 .. n` while `remainingOrders > 0`:
   * Set:

     ```text
     currLevel = descInventory[blockLength - 1]
     nextLevel = descInventory[blockLength] if it exists, 0 otherwise
     ```
   * Compute `levelCount = currLevel - nextLevel`.
   * If `levelCount == 0`, skip this prefix: it is not active and corresponds to no price levels.
   * Compute the number of orders represented by the entire range:
     ```text
     ordersForWholeRange = blockLength * levelCount
     ```
   * **Consume the whole range** if `remainingOrders >= ordersForWholeRange`:
     * Add:

       ```text
       blockLength * sumInclusive(nextLevel + 1, currLevel)
       ```

       to `profit`.
     * Subtract `ordersForWholeRange` from `remainingOrders`.
   * **Otherwise, consume the final partial range**:
     * Compute:

       ```text
       completeLevels = floor(remainingOrders / blockLength)
       colorsAtPartialLevel = remainingOrders % blockLength
       ```
     * Add all complete levels:

       ```text
       lowestCompleteLevel = currLevel - completeLevels + 1

       profit += blockLength * sumInclusive(lowestCompleteLevel, currLevel)
       ```
     * Add the remaining balls from the next price level:

       ```text
       profit += colorsAtPartialLevel * (lowestCompleteLevel - 1)
       ```
     * Set `remainingOrders = 0` and terminate the traversal.
4. Return `profit % MODULO`.

<a id="correctness"></a>

### Correctness

From the brute-force argument, the optimal answer is exactly the sum of the first `orders` elements of `DESC_PRICES`. It remains to show that the optimized traversal computes this same prefix.

For each `blockLength`, Observation 3 identifies exactly the consecutive price levels whose blocks in `DESC_PRICES` have length `blockLength`:

```text
currLevel, currLevel-1, ..., nextLevel+1
```

These ranges are encountered in descending price order and together partition all price levels from `max(inventory)` down to `1`.

Observation 4 computes an entire range at once when enough orders remain. This is exactly equivalent to traversing all of its corresponding blocks in `DESC_PRICES`.

When the requested prefix ends inside a range, Observation 5 first takes as many complete highest-valued blocks as possible, and then takes only the required number of entries from the next block. This is exactly how the prefix of `DESC_PRICES` ends.

Therefore, at every stage, the optimized algorithm accumulates exactly the same values that a left-to-right traversal of `DESC_PRICES` would accumulate.

Hence the final accumulated profit equals the maximum possible profit.

<a id="complexity"></a>

### Complexity

Let:

```text
n = |inventory| = number of colors
```

Sorting `inventory` requires `O(n log n)` time. The subsequent traversal considers each possible `blockLength` once, performs only `O(1)` work per iteration, and therefore requires `O(n)` time. Thus the total time complexity is `O(n log n)`.

Unlike the brute-force formulation, the running time does **not** depend on `inventorySum = sum(inventory[i])` which may be much larger than `n`.

If a sorted copy of `inventory` is created, it requires `O(n)` additional space. If the input may be sorted in place, that copy is unnecessary; any remaining auxiliary space depends on the sorting implementation.

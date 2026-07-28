## Proof for LeetCode 3306 (Count of Substrings Containing Every Vowel and K Consonants II)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given a string `word` and an integer `k`, return the number of substrings that contain every vowel (`'a'`, `'e'`, `'i'`, `'o'`, `'u'`) at least once and exactly `k` consonants.

### Context
This problem strongly reminds the classic "anagram" sliding-window challenges, but it is a harder, more modern variant: the window must simultaneously satisfy a coverage constraint (all five vowels present) and an exact-count constraint (precisely `k` consonants). The counting twist - turning a single nice window into a whole range of nice substrings — is where most of the subtlety lives.

### Notation
- `n` - length of `word`
- `VOWELS` - the set `{ 'a', 'e', 'i', 'o', 'u' }`
- consonant - any character that is not a vowel
- **nice** window  a substring `[l, r]` (inclusive) that contains all five vowels at least once **and** exactly `k` consonants
- `isNice(l, r)` - indicator function returning `true` if `[l, r]` is nice, else `false`
- `shortestNiceEnd(start)` - given start index `start`, the leftmost index `r >= start` such that `[start, r]` is nice (undefined if no nice substring starts at `start`). In other words, the end of the shortest nice window anchored at `start`.
- `nextConsonant(i)` - the leftmost consonant index strictly greater than `i`, or `n` if no such consonant exists.

---

### Key Observations

#### Observation 1 - How many nice substrings start at index `i`
**Claim**: The number of nice substrings starting at index `i` is exactly `nextConsonant(shortestNiceEnd(i)) - shortestNiceEnd(i)` (and `0` if `shortestNiceEnd(i)` is undefined).

**Reasoning**: Fix a start index `i` and consider the set of right endpoints `r` for which `[i, r]` is nice. Let `e = shortestNiceEnd(i)`. We show this set is exactly the contiguous range `[e, nextConsonant(e) - 1]`, by splitting on the position of `r`. Here `nextConsonant(e)` is the first index whose inclusion would push the consonant count of the already-nice window `[i, e]` to `k + 1`:

- **`r < e`**: Not nice. By definition `e = shortestNiceEnd(i)` is the *leftmost* right endpoint yielding a nice window, so no shorter window anchored at `i` qualifies.
- **`r in [e, nextConsonant(e) - 1]`**: Nice. Every index in `(e, r]` lies strictly before the next consonant (which sits at `nextConsonant(e)`), so all of those added characters are vowels. Extending the already-nice window `[i, e]` by vowels keeps all five vowels present and leaves the consonant count unchanged at exactly `k`. Hence `[i, r]` is still nice.
- **`r >= nextConsonant(e)`**: Not nice. The window now contains the consonant at `nextConsonant(e)`, so its consonant count is at least `k + 1`, violating the exact-count constraint.

Therefore the nice right endpoints form the contiguous block `[e, nextConsonant(e) - 1]`, whose size is `nextConsonant(e) - e` = `nextConsonant(shortestNiceEnd(i)) - shortestNiceEnd(i)`.

#### Observation 2 - Monotonicity of `shortestNiceEnd`
**Claim**: `shortestNiceEnd` is non-decreasing: `shortestNiceEnd(i + 1) >= shortestNiceEnd(i)`.

**Reasoning**: Let `r = shortestNiceEnd(i)`, so `[i, r]` is the shortest nice window anchored at `i`. Advancing the start from `i` to `i + 1` drops the character `word[i]` from the left. We separate into cases:

- **`word[i]` is an excessive vowel** (it appears more than once within `[i, r]`): Removing one of its occurrences leaves all five vowels still present, and the consonant count is unchanged. The window `[i + 1, r]` remains nice, so `shortestNiceEnd(i + 1) = r`. It cannot be smaller, since any window `[i + 1, r']` with `r' < r` is a subset of the non-nice `[i, r']` (removing a vowel can neither restore a missing vowel nor change the consonant count).
- **`word[i]` is a non-excessive vowel, or a consonant**: Removing it either makes one vowel go missing or drops the consonant count below `k`. Either way `[i + 1, r]` is no longer nice, so the window must be expanded rightward to recover niceness: `shortestNiceEnd(i + 1) > r`.

In both cases `shortestNiceEnd(i + 1) >= shortestNiceEnd(i)`. This monotonicity is exactly what allows a single forward sweep of the right pointer across the whole scan: it never needs to move backward as the start advances.

#### Observation 3 - Monotonicity of `nextConsonant`
**Claim**: `nextConsonant` is non-decreasing: `nextConsonant(i + 1) >= nextConsonant(i)`.

**Reasoning**: By definition, `nextConsonant(i)` is the leftmost consonant index strictly greater than `i`. This map is itself non-decreasing in `i`. Composing it with the non-decreasing `shortestNiceEnd` (Observation 2) yields a non-decreasing function `i ↦ nextConsonant(shortestNiceEnd(i))` - the quantity the algorithm actually uses. Therefore the next-consonant pointer, like the right pointer, only ever advances - each index is scanned at most once across the entire run.

---

### Algorithm Outline
Maintain a sliding window with `left`, `right`, a monotone `nextConsonant` pointer, a vowel-frequency map, and a consonant counter. Define `isNice()` as "the window holds all five vowels and the consonant count equals `k`".

1. Initialize `left = 0`, `right = 0`, `substringsCount = 0`, an empty vowel-frequency map, and `consonantsCount = 0`.
2. **Main loop** (while `right` is within `word`):
   - **Excessive consonants** (`consonantsCount > k`): shrink from the left (drop `word[left]`, increment `left`). Expanding right could only add more consonants, so shortening is the only way forward.
   - **Not nice yet**: expand from the right (add `word[right]`, increment `right`).
   - **Nice**: this is the shortest nice window anchored at `left`, so the current inclusive end is `shortestNiceEnd(left)`. Advance the pointer to `nextConsonant(shortestNiceEnd(left))`, add `nextConsonant(shortestNiceEnd(left)) - shortestNiceEnd(left)` to `substringsCount` (Observation 1), then shrink from the left to move on to the next start index (Observation 2 guarantees the right pointer need not retreat).
3. **Digest phase**: once `right` reaches `n`, the right side can no longer expand. Keep shrinking from the left while the window is still nice, counting each such trailing window. This catches nice windows whose rightward extension was blocked only by the end of the string (e.g. a tail like `"...aeiou"`).
4. Return `substringsCount`.

### Correctness Sketch
- **Observation 1** converts each anchored start index into a count of nice substrings in `O(1)`, by proving the nice right endpoints form one contiguous range `[shortestNiceEnd(i), nextConsonant(shortestNiceEnd(i)) - 1]`. Every nice substring is counted exactly once - at its unique start index.
- **Observation 2** shows `shortestNiceEnd` never decreases as the start advances, so a single forward right pointer suffices and no nice window is skipped.
- **Observation 3** shows `nextConsonant` never decreases either, and thus neither does `nextConsonant(shortestNiceEnd(i))`, so the next-consonant scan is also a single forward sweep rather than a per-start rescan.
- The digest phase accounts for the boundary case where niceness persists up to the end of the string, ensuring those trailing windows are not lost when the right pointer can no longer move.

Together these guarantee that every nice substring is counted, none is double-counted, and the work per index is amortized constant.

### Complexity
- **Time**: `O(n)` - each of `left`, `right`, and `nextConsonant` advances at most `n` times over the entire run.
- **Space**: `O(1)` - a fixed-size vowel-frequency map (at most five keys) plus a handful of counters.

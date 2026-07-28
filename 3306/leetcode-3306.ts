/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 *
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 *
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

const VOWELS: ReadonlySet<string> = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Encapsulates the multiset of characters in the current window, exposing only
 * the two predicates the sweep cares about: whether all five vowels are present,
 * and how many consonants the window holds.
 *
 * Hiding the frequency bookkeeping here keeps the main loop readable - the loop
 * reasons about windows, not about map maintenance.
 */
class WindowState {
  private readonly vowelFrequencies = new Map<string, number>();
  private consonants = 0;

  public add(character: string): void {
    if (!VOWELS.has(character)) {
      ++this.consonants;
      return;
    }

    this.vowelFrequencies.set(
      character,
      (this.vowelFrequencies.get(character) ?? 0) + 1
    );
  }

  public remove(character: string): void {
    if (!VOWELS.has(character)) {
      --this.consonants;
      return;
    }

    const updatedFrequency = this.vowelFrequencies.get(character)! - 1;
    if (updatedFrequency === 0) {
      this.vowelFrequencies.delete(character);
    } else {
      this.vowelFrequencies.set(character, updatedFrequency);
    }
  }

  public get hasAllVowels(): boolean {
    return this.vowelFrequencies.size === VOWELS.size;
  }

  public get consonantsCount(): number {
    return this.consonants;
  }
}

/**
 * LeetCode 3306: Count of Substrings Containing Every Vowel and K Consonants II
 *
 * Counts substrings of `word` that contain every vowel ('a', 'e', 'i', 'o', 'u')
 * at least once and exactly `k` consonants.
 *
 * - Full proof and detailed reasoning: see 3306/README.md
 * - Proof outline (short):
 *   1) Sweep a window [left, right); for each `left`, locate
 *      shortestNiceEnd(left) (inclusive end of the shortest nice window;
 *      equals right - 1 under the exclusive-right convention).
 *   2) Nice substrings starting at `left` end in
 *      [shortestNiceEnd(left), nextConsonant(shortestNiceEnd(left)) - 1];
 *      their count is nextConsonantIndex - right + 1 (same quantity under
 *      the exclusive-right convention).
 *   3) shortestNiceEnd is monotonically non-decreasing in `left`, so a
 *      single forward right pointer suffices (no backtracking).
 *   4) nextConsonant is monotonically non-decreasing, and thus so is
 *      nextConsonant(shortestNiceEnd(left)); the next-consonant scan
 *      visits each index at most once overall.
 *   5) A digest phase counts trailing nice windows whose extension is
 *      blocked only by the end of the string.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * ### Complexity
 * - Time: O(n) - Each of `left`, `right`, and `nextConsonantIndex` advances at
 *   most n times across the whole run.
 * - Space: O(1) - The vowel-frequency map holds at most five keys.
 *
 * @param word - Input string of lowercase English letters
 * @param k    - Exact number of consonants a nice substring must contain
 * @returns Number of substrings containing every vowel at least once and exactly k consonants
 */
export function countOfSubstrings(word: string, k: number): number {
  const n = word.length;
  if (n === 0) return 0;

  const windowState = new WindowState();

  let left = 0;
  let right = 0; // Exclusive: the window currently covers word[left, right).
  let nextConsonantIndex = 0;
  let niceSubstringsCount = 0;

  const isNice = (): boolean =>
    windowState.hasAllVowels && windowState.consonantsCount === k;

  // Advances nextConsonantIndex to the first consonant at or after `right`
  // (or n if none).
  const advanceNextConsonantIndex = (): void => {
    if (nextConsonantIndex === n || nextConsonantIndex >= right) return;

    nextConsonantIndex = right;
    while (nextConsonantIndex < n && VOWELS.has(word[nextConsonantIndex])) {
      ++nextConsonantIndex;
    }
  };

  while (right < n) {
    while (windowState.consonantsCount > k) {
      // Excess consonants: expanding right can only add more, so shrink instead.
      windowState.remove(word[left++]);
    }

    if (!isNice()) {
      windowState.add(word[right++]);
      continue;
    }

    // [left, right) is the shortest nice window anchored at `left`. Every nice
    // substring starting at `left` ends within [right - 1, nextConsonantIndex - 1],
    // contributing nextConsonantIndex - right + 1 of them.
    advanceNextConsonantIndex();
    niceSubstringsCount += nextConsonantIndex - right + 1;
    windowState.remove(word[left++]);
  }

  // Digest trailing windows. A surviving start has its shortest (hence only) nice
  // window ending at n - 1, so it contributes exactly one nice substring.
  while (isNice()) {
    ++niceSubstringsCount;
    windowState.remove(word[left++]);
  }

  return niceSubstringsCount;
}

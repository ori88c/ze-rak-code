## Proof for LeetCode 1353 (Maximum Number of Events That Can Be Attended)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given events `[start, end]`, maximize how many events you can attend. Each event can be attended on any day within its interval, but you can only attend one event per day.

### Notation
- `n` — number of events  
- Events are sorted by ascending `start` into `ASC_BY_START`
- `currDay` — monotonically non-decreasing current day candidate
- Min-heap keyed by `end` for events overlapping `currDay`

### Key Observations
#### Observation 1 — Unique starts/ends are easy
If all events have unique starts (or unique ends), attending each on its start (or end) day is feasible; conflicts only arise when starts or ends are shared.

#### Observation 2 — Identical spans
For `k` events sharing identical `[s, e]`, the answer is `min(k, e - s + 1)`. Only span length limits attendance in this case (e.g., three events `[1,2]` allow at most 2 attendances).

#### Observation 3 — Same start, different ends ⇒ process by smallest end
When events share a start but differ in end, allocate the smallest-end event first (e.g., [1,1], [1,2], [1,3]) to leave later days available for longer intervals. This is the greedy step: among events overlapping `currDay`, prioritize the earliest end; a min-heap keyed by end implements this choice efficiently.

#### Observation 4 — One allocation per day iteration
Maintain `currDay` as the day being allocated. Add all events starting at `currDay` into the min-heap (keyed by end), evict heap entries with `end < currDay`, then allocate **exactly one event** (smallest end) to `currDay` and advance.

Allocating multiple days in one loop pass can consume a tight interval before it’s even added. Example: [1,10], [1,10], [2,2]. If you pop repeatedly on day 1, you might exhaust a slot before [2,2] arrives (at `currDay = 2`). One allocation per iteration ensures [2,2] enters the heap when `currDay = 2` and is chosen (it has the smallest end), so it isn’t skipped.

### Edge Cases / Examples
- Identical intervals: `[1,3]` repeated 4 times ⇒ answer `3` (span length).  
- Shared start with tighter interval: [1,10], [1,10], [2,2]. If you allocate day 2 to a [1,10], the [2,2] event is lost; picking the smallest end first keeps [2,2] and still leaves room for the longer intervals.  
- Shared start differing ends: `[1,1], [1,2], [1,3]` — process by ascending end to maximize feasibility.  

### Algorithm Outline
1. Sort events ascending by start into `ASC_BY_START`.  
2. Iterate days via `currDay`, driven by events and heap state:  
   - Evict from heap any event with `end < currDay`.  
   - If heap empty, and events remain, jump `currDay` to the next event’s start.  
   - Push all events whose start equals `currDay` into the min-heap (keyed by end, tie-break by start if needed).  
   - If heap non-empty: pop the smallest end, attend it on `currDay`, increment answer, and advance `currDay`.  
3. Repeat while events remain or heap non-empty.  

### Correctness Sketch
- Observations 1+2 handle unique or identical-span cases.  
- Observation 3 ensures intervals with shorter end points take precedence when starts are equal, so they aren’t blocked by intervals that end later.  
- Observation 4 (one allocation per day with earliest-end choice) is the classic interval-greedy: among overlaps, choosing the earliest end **preserves maximal future feasibility**; evicting `end < currDay` maintains validity; jumping `currDay` when heap is empty **skips non-assignable gaps**.  
- Thus each step is **locally optimal** and produces a globally maximal count of attended events.  

### Complexity
- Sorting: `O(n log n)`  
- Heap operations across all events: `O(n log n)`  
- Space: `O(n)` for heap and sorted array.  


## Proof for LeetCode 2589 (Minimum Time to Complete All Tasks)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Similarities with LeetCode 1353
I find both problems to share one prominent similarity: each provides a **range constraint** that is *not* required to achieve an `O(n log n)` solution, yet - if leveraged - offers a considerable shortcut that lowers the problem's apparent difficulty. In LeetCode 1353 the given constraint is `1 <= startDayi <= endDayi <= 10^5`, and in 2589 it is `1 <= starti, endi <= 2000`.

My solutions deliberately attain the tightest time complexity **without** relying on those constraints, which I find makes the problems far more interesting and real-life oriented. Leveraging the constraint instead yields `O(n log n + n * timeSlotsCount)`, which collapses to roughly `O(n log n)` only if one treats the upper bound (the maximum day, or the maximum time slot) as a constant.

### Problem (brief)
Given tasks `[start, end, duration]`, each task must run for `duration` total (not necessarily consecutive) integer time points within its interval `[start, end]`. The computer can run an unlimited number of tasks in parallel whenever it is turned on. Return the minimum number of time points during which the computer must be on, such that all tasks complete.

---

### Intuition - Why Is Postponing Execution Beneficial?

The single most important structural fact of this problem is that **an ON slot is shared**: a slot at time `t` simultaneously advances *every* task whose interval contains `t`. Minimizing total ON time is therefore a matter of maximizing slot reuse.

**Example 1 — Any earlier allocation is suboptimal**: Consider `A = [1, 5], duration 2` and `B = [4, 6], duration 2`.

- Eager placement of A's slots at times `{1, 2}`: neither slot lies inside `B = [4, 6]`, so B requires 2 additional slots. Total: **4**.
- Placement at `{3, 4}`: slot 4 is reused by B, which then requires only 1 additional slot. Total: **3**.
- Fully postponed placement at `{4, 5}`: both slots lie inside B's interval, so B requires nothing further. Total: **2** (optimal).

Every one of A's slots placed before time 4 lies outside B's interval and is therefore wasted with respect to B - each such slot strictly worsens the result. Only the maximally postponed placement is fully reusable.

**Example 2 — One postponed batch serves many tasks**: Consider `A = [1, 10], duration 3`, `B = [8, 10], duration 3`, and `C = [9, 10], duration 2`.

- Eager placement of A's slots at `{1, 2, 3}`: B still forces slots `{8, 9, 10}` (its interval has no slack), and C is covered by `{9, 10}`. Total: **6**.
- Postponed placement of A's slots at `{8, 9, 10}`: this single batch simultaneously completes A, B, and C. Total: **3** (optimal).

The greedy strategy is: delay every allocation until some task can no longer wait, and only then allocate the minimum forced amount.

---

### Notation
- `n` - number of tasks
- **ON slot** - an integer time point at which the computer is on. A slot at time `t` advances every task whose interval contains `t`.
- **Active task** - a task whose interval has already begun (the sweep has passed its `start`) but which may still require additional ON slots.
- `latestFeasibleStart` - for a task `[start, end, duration]`: `end - duration + 1`. The rightmost time at which the task may begin accumulating **all** of its required ON slots, if every slot is postponed as much as possible. Fixed at insertion; never changes.
- `accumulatedOnTimeSlots` - the total number of ON slots allocated so far, across all tasks (a single global counter).
- `accumulatedOnTimeSlotsAtInsertion` - a snapshot of `accumulatedOnTimeSlots`, recorded at the moment a task becomes active.
- `effectiveLatestStart` - for an active task: `latestFeasibleStart + (number of ON slots already allocated inside its interval)`. The latest time at which the task may postpone its **next** ON slot while still remaining feasible. Unlike `latestFeasibleStart`, this value shifts rightward as slots accumulate (formalized in Lemma 1).
- `endExclusive` - `end + 1`; the first invalid time after the task's interval.

---

### Algorithm (High Level)

The description below is intentionally free of implementation details — no data structures, no code. Those decisions are *derived* in the lemmas that follow.

1. **Process tasks in ascending order of `start`.** An ON slot can serve a task only if it falls inside the task's interval, so slots allocated before a task's `start` can never serve it. Sweeping chronologically guarantees that when a task becomes active, all previously forced allocations lie strictly before its interval — and, symmetrically, that all future allocations are candidates for sharing among every active task.
2. **Maintain the set of active tasks** - tasks whose interval has begun but which may still require ON slots.
3. **Before advancing to the next task's `start`, repeatedly ask: is there an active task that can no longer wait?** That is, an active task whose `effectiveLatestStart` precedes the next task's `start`. If so, allocate the minimum number of ON slots required to restore feasibility, conceptually placing them at the latest possible times (immediately following that task's `effectiveLatestStart`).
4. **Among all active tasks, always serve the one with the smallest `effectiveLatestStart`** - the task with the least remaining scheduling flexibility. Lemma 3 proves that if any task forces an allocation, it is this one.
5. A **sentinel task at infinity** is appended after the last real task, so the final sweep step flushes all remaining active tasks.
6. Return `accumulatedOnTimeSlots`.

---

### Key Observations and Lemmas

#### Observation 1 - A task becomes active with zero accumulated ON slots
Recall from the algorithm that ON slots are only ever allocated *before* the sweep advances to the next task's `start`, and each such slot is placed at a time strictly earlier than that `start`. Therefore, at the instant a task becomes active, every ON slot allocated so far lies strictly before the task's own `start` — that is, outside its interval `[start, end]`.

Consequently, at the moment of insertion, the task has accumulated exactly zero ON slots — which is precisely why we snapshot `accumulatedOnTimeSlotsAtInsertion` at that moment: every slot counted *before* the snapshot is irrelevant to this task; every slot counted *after* it is relevant (Observation 2).

#### Observation 2 - Every allocated slot is shared by all active tasks
**Claim**: Every ON slot allocated by the algorithm lies inside the interval of every active task that still requires ON slots (up to the moment that task is satisfied).

**Proof**: Every allocation is driven by the most urgent active task `U` and places slots starting at time `L = effectiveLatestStart(U)`, the smallest `effectiveLatestStart` among active tasks. Take any active task `X` that still awaits slots; we show that every placed slot time `t` lies in `[X.start, X.end]`.

- **Lower end** (`t >= X.start`): Since `t >= L`, it suffices to show `L` is at least every active task's `start`. Let `X*` be the active task with the largest `start`; because tasks activate in ascending `start` order, `X*` is the most recently activated one. Immediately before `X*` activated, the algorithm had allocated slots until no active task could be forced earlier than `X*.start` — so every surviving active task then had `effectiveLatestStart >= X*.start`, and `X*` itself entered with `effectiveLatestStart = latestFeasibleStart >= X*.start`. No task with a larger `start` has activated since, and `effectiveLatestStart` values only grow, so every active task still satisfies `effectiveLatestStart >= X*.start`. Hence `L >= X*.start >= X.start`.
- **Upper end** (`t <= X.end`): Each slot is placed at the current `effectiveLatestStart` of the most urgent task `U` - the smallest among active tasks - so `t = effectiveLatestStart(U) <= effectiveLatestStart(X)`. As long as `X` is unsatisfied, `effectiveLatestStart(X) < endExclusive(X)` (Lemma 2). Hence `t < endExclusive(X)`, i.e. `t <= X.end`.

Therefore every allocated slot lies inside the interval of every still-unsatisfied active task, advancing them all at once until each is satisfied.

#### Observation 3 — Slot counting via the global counter
For every active task that is not yet satisfied,

`accumulatedOnTimeSlots - accumulatedOnTimeSlotsAtInsertion`

equals exactly the number of ON slots already allocated inside its interval.

**Proof**: By Observation 1, the task had accumulated zero slots upon insertion, and the snapshot equals the global counter at that moment. By Observation 2, every subsequent allocation lies inside the task's interval (until satisfaction). Thus each increment of `accumulatedOnTimeSlots` after insertion contributes exactly one slot to the task, and the difference above is exact.

This is the pivotal trick of the entire algorithm: **a single global counter tracks the per-task progress of every active task simultaneously**, with no per-task bookkeeping beyond the one-time snapshot.

#### Lemma 1 — `effectiveLatestStart` tracks remaining flexibility
For every active task,

`effectiveLatestStart = latestFeasibleStart + (accumulatedOnTimeSlots - accumulatedOnTimeSlotsAtInsertion)`

is the latest time at which the task may postpone allocating its next ON slot while remaining feasible.

**Proof**: Initially the task may delay its first ON slot until `latestFeasibleStart` - by definition, the rightmost time from which all `duration` slots still fit before `end`. After accumulating one ON slot, only `duration - 1` slots remain, so the next slot may be postponed by one additional time unit. By induction, every allocated slot shifts the latest feasible beginning of the remaining schedule rightward by exactly one.

#### Lemma 2 — Completion criterion
An active task has received all of its required ON slots **iff** `effectiveLatestStart >= endExclusive`.

**Proof**: Initially,

`endExclusive - latestFeasibleStart = (end + 1) - (end - duration + 1) = duration`

By Lemma 1, each allocated ON slot increases `effectiveLatestStart` by one. Therefore, after exactly `duration` allocated slots, `effectiveLatestStart` reaches `endExclusive`, and the task is completely satisfied. Conversely, before all required slots have been allocated, `effectiveLatestStart < endExclusive`. Thus the condition is equivalent to task completion - and satisfied tasks can be detected (and discarded) using only the quantities already at hand.

#### Lemma 3 — Greedy choice: serve the smallest `effectiveLatestStart`
**Claim (a)**: If any active task must receive an ON slot before the next task's `start`, then the task with the smallest `effectiveLatestStart` must receive it.

**Claim (b)**: The slots the algorithm allocates are mandatory: every feasible schedule must place them before the next task's `start`, so allocating them immediately is never worse than any alternative.

**Proof of (a)** - by exchange: Let `A` and `B` be active tasks with `effectiveLatestStart(A) < effectiveLatestStart(B)`. If `A` cannot postpone its next ON slot until the next task's `start`, then `B` can certainly wait at least as long as `A`. By Observation 2, every allocated slot benefits both tasks equally, so allocating a slot "because of `B`" instead of "because of `A`" cannot make `A` feasible again - the slot count is the same either way, and it is `A`'s deadline that binds first. Consequently, if some task forces an allocation, it must be the one with the smallest `effectiveLatestStart`.

**Proof of (b)**: Suppose the most urgent task `A` satisfies `effectiveLatestStart(A) < nextStart`. By Lemma 1, delaying `A`'s next ON slot to `nextStart` or later violates `A`'s feasibility. Therefore *every* feasible schedule must contain the same number of ON slots before `nextStart` that the algorithm is forced to allocate. Since every allocated slot simultaneously benefits every currently active task (Observation 2), and the slots are placed at the latest times still permitted (maximizing overlap with future intervals, as motivated in the Intuition section), allocating them immediately cannot increase the total number of ON slots required later. The greedy decision is thus forced in every feasible schedule.

#### Corollary — A min-priority queue suffices
By Lemma 3, the only active task that ever needs to be examined is the one with the smallest `effectiveLatestStart`: either it can wait until the next task's `start` (and then so can every other active task), or it forces an allocation. Therefore, maintaining the active tasks inside a **min-priority queue keyed by urgency** is sufficient.

#### Lemma 4 — Heap ordering: compare by the Fixed share of `effectiveLatestStart`
The **most meaningful comparer** for the priority queue would compare tasks by `effectiveLatestStart` - this is the quantity we care about the most, as it prioritizes tasks that are becoming almost non-feasible due to lack of available time slots in their valid range. However, ordering a min-heap directly by `effectiveLatestStart` is impossible: the value keeps changing - *every* allocation shifts it (Lemma 1).

The resolution is to decompose `effectiveLatestStart` into a per-task **Fixed share** and a global **Dynamic share**:

`effectiveLatestStart = (latestFeasibleStart - accumulatedOnTimeSlotsAtInsertion) + accumulatedOnTimeSlots`

- **Fixed share**: `latestFeasibleStart - accumulatedOnTimeSlotsAtInsertion` - both terms are frozen at insertion time and never change.
- **Dynamic share**: `accumulatedOnTimeSlots` - the global counter, which is *identical for every task in the heap* at any given moment.

Since the Dynamic share is common to all heap items, it **cannot affect their relative order**. Ordering by the Fixed share alone therefore induces **exactly** the same order as ordering by the full `effectiveLatestStart`, while remaining a valid heap key (it never changes after insertion).

**Admittedly, this comparer is less intuitive** than the quantity it represents. The reader should think of it as: *"compare by the Fixed share of `effectiveLatestStart`"* - while conceptually it is simply *"compare by `effectiveLatestStart`"*. The heap root is thus always the most urgent active task, as the Corollary requires.

#### Lemma 5 — Allocation minimality
The algorithm never allocates more ON slots than necessary before processing the next task.

**Proof**: Suppose the most urgent active task has `effectiveLatestStart = L < nextStart`. The algorithm allocates exactly

`delta = min(endExclusive, nextStart) - L`

slots. By Lemma 1, each allocated slot shifts `effectiveLatestStart` rightward by one, so after the batch one of two events occurs:

- the task's `effectiveLatestStart` reaches `endExclusive` - the task is satisfied (Lemma 2), or
- the task's `effectiveLatestStart` reaches `nextStart` - the task can safely wait until the next task begins.

Either event makes further allocations on behalf of this task unnecessary before the next task is processed. The loop then re-examines the (new) most urgent task under the same rule, so every batch is exactly the minimum mandatory amount and nothing more.

#### Theorem — Optimality
The algorithm returns the minimum possible total ON time.

**Proof**: By Lemma 1, every active task's `effectiveLatestStart` correctly tracks its remaining scheduling flexibility, and by Lemma 4 the priority queue always exposes the most urgent active task. By Lemma 3, whenever the algorithm allocates ON slots, every feasible schedule must allocate the same number of slots before the next task begins — so every allocated slot is unavoidable. By Lemma 5, the algorithm allocates no more than this mandatory amount — so no unnecessary slot is ever added.

Since tasks are processed in chronological order and the sentinel task at infinity flushes all remaining active tasks, every task is driven to its completion criterion (Lemma 2) and receives exactly its required `duration`. The produced schedule is therefore feasible, and no feasible schedule can use fewer ON slots. Hence the returned `accumulatedOnTimeSlots` is optimal.

---

### Correctness Sketch
- The **Intuition** section establishes the guiding principle: ON slots are shared, so postponing allocations to the latest forced moment maximizes reuse by tasks not yet discovered.
- **Observation 1** shows that snapshotting `accumulatedOnTimeSlotsAtInsertion` at activation is exact - no earlier slot is relevant to the new task.
- **Observation 2** proves the sharing invariant: every allocated slot lies inside the interval of every active, unsatisfied task.
- **Observation 3** turns the sharing invariant into arithmetic: a single global counter tracks per-task progress via the difference `accumulatedOnTimeSlots - accumulatedOnTimeSlotsAtInsertion`.
- **Lemma 1** formalizes `effectiveLatestStart` as the task's remaining flexibility; **Lemma 2** derives the completion criterion `effectiveLatestStart >= endExclusive`.
- **Lemma 3** proves the greedy choice: only the smallest `effectiveLatestStart` can force an allocation, and forced slots appear in every feasible schedule. The **Corollary** concludes that a min-priority queue is the right structure.
- **Lemma 4** justifies the non-obvious heap comparer: ordering by the Fixed share of `effectiveLatestStart` is equivalent to ordering by `effectiveLatestStart` itself, because the Dynamic share is global.
- **Lemma 5** bounds each batch to the exact mandatory amount, and the **Theorem** combines lower bound (every slot is forced) with upper bound (no extra slot) to conclude optimality.

### Complexity
- **Time**: `O(n log n)` - Sorting dominates. Each task is pushed into and popped from the priority queue at most once (`O(log n)` each). Every inner-loop iteration either pops a satisfied task, performs an allocation batch (after which the root is either popped or can wait), or terminates - so the total number of iterations is `O(n)`.
- **Space**: `O(n)` - For the sorted task array and the priority queue of active tasks.

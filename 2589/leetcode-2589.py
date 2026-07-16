"""
Copyright (c) 2026 https://github.com/ori88c/
All rights reserved.

This code may NOT be copied, modified, or translated to other languages.
For self-study purposes only.

See LICENSE file or visit https://github.com/ori88c/ for full terms.
"""

from dataclasses import dataclass
from heapq import heappush, heappop


@dataclass(order=True)
class Task:
    """A task to be scheduled.

    Ordering is by (start, end, duration), so sorting a list of tasks
    yields chronological order by start time.

    Attributes:
        start: First time point at which the task may run.
        end: Last time point at which the task may run.
        duration: Number of (not necessarily consecutive) ON time points
            the task requires within [start, end].
    """

    start: int
    end: int
    duration: int


@dataclass
class ActiveTask:
    """A task whose interval has begun but may still require ON slots.

    Attributes:
        latest_feasible_start: The rightmost time at which the task may begin
            accumulating all of its required ON slots, assuming every slot is
            postponed as much as possible. Fixed at insertion; never changes.
        accumulated_on_time_slots_at_insertion: Snapshot of the global
            accumulated_on_time_slots taken when the task became active. Since
            the task had accumulated zero ON slots at that moment, the number
            of ON slots allocated inside its interval so far equals
            accumulated_on_time_slots - accumulated_on_time_slots_at_insertion.
        end_exclusive: First invalid time after the task's interval (end + 1).
    """

    latest_feasible_start: int
    accumulated_on_time_slots_at_insertion: int
    end_exclusive: int

    @property
    def priority(self) -> int:
        # The most meaningful comparer would order by effective_latest_start,
        # the quantity we care about most: it prioritizes tasks nearing
        # infeasibility. But effective_latest_start keeps changing as ON slots
        # accumulate, so it cannot serve as a stable heap key. It decomposes
        # into a Fixed share (latest_feasible_start - accumulated_on_time_slots_at_insertion)
        # plus a Dynamic share (accumulated_on_time_slots) that is identical for
        # every heap item at any moment. Ordering by the Fixed share alone
        # therefore induces exactly the same order. Conceptually: compare by the
        # Fixed share of effective_latest_start, which is the same as comparing
        # by effective_latest_start itself.
        return self.latest_feasible_start - self.accumulated_on_time_slots_at_insertion

    def __lt__(self, other: "ActiveTask") -> bool:
        return self.priority < other.priority


def minimum_on_time(tasks: list[Task]) -> int:
    """LeetCode 2589: Minimum Time to Complete All Tasks.

    Given tasks [start, end, duration], each task must run for `duration`
    total (not necessarily consecutive) integer time points within its
    interval [start, end]. The computer runs any number of tasks in parallel
    whenever it is on. Returns the minimum number of ON time points such that
    all tasks complete.

    Full proof and detailed reasoning: see 2589/README.md.

    Proof outline (short):
        1) Process tasks in ascending start; maintain the active tasks (those
           whose interval has begun but which may still require ON slots).
        2) An ON slot is shared by every active task whose interval contains
           it, so postpone every allocation to the latest forced moment to
           maximize reuse by tasks that start later.
        3) When the most urgent active task can no longer wait, allocate the
           minimum ON slots that restore its feasibility; the most urgent task
           is the one with the smallest effective_latest_start.
        4) A min-heap keyed by the Fixed share of effective_latest_start
           exposes that task; the Dynamic share (accumulated_on_time_slots) is
           common to all items, so it does not affect ordering.
        5) A sentinel task at infinity flushes the remaining active tasks.

    Comment philosophy:
        Comments are generally discouraged; the code should be
        self-explanatory. Here they focus on reasoning/proof (the "why"),
        not restating the "what".

    Complexity:
        Time: O(n log n) - Sorting dominates; each task is pushed and popped
            from the heap at most once, and the allocation loop runs O(n)
            times overall.
        Space: O(n) - For the sorted tasks and the heap of active tasks.

    Args:
        tasks: The tasks to schedule, each with start, end, and duration.

    Returns:
        The minimum total ON time required to complete all tasks.
    """
    INF = 10**18

    # Process tasks in chronological order. A sentinel task flushes
    # any remaining active tasks after the last real task.
    tasks = sorted(tasks)
    tasks.append(Task(INF, INF, 1))

    # Total number of ON slots allocated so far.
    accumulated_on_time_slots = 0

    # Tasks whose intervals have started but whose required ON slots
    # may still need to be allocated.
    active_tasks: list[ActiveTask] = []

    for next_task in tasks:

        # Before reaching the next task's start, repeatedly satisfy the
        # most urgent active task whenever postponing it any further would
        # make it impossible to complete.
        while active_tasks:

            most_urgent_active_task = active_tasks[0]
            accumulated_on_time_slots_since_insertion = accumulated_on_time_slots - most_urgent_active_task.accumulated_on_time_slots_at_insertion

            # Every ON slot allocated since insertion shifts this task's
            # latest feasible start one unit to the right.
            effective_latest_start = (
                most_urgent_active_task.latest_feasible_start
                + accumulated_on_time_slots_since_insertion
            )

            # No active task is urgent yet.
            if effective_latest_start >= next_task.start:
                break

            # This task has already accumulated all required ON slots.
            if effective_latest_start >= most_urgent_active_task.end_exclusive:
                heappop(active_tasks)
                continue

            # Allocate only the minimum number of ON slots required before
            # either the task becomes satisfied or the next task begins.
            delta = (
                min(most_urgent_active_task.end_exclusive, next_task.start)
                - effective_latest_start
            )
            accumulated_on_time_slots += delta

        # This task is now active. Record the current accumulated ON slots
        # so that future allocations can determine how much its latest
        # feasible start has shifted.
        heappush(
            active_tasks,
            ActiveTask(
                latest_feasible_start=next_task.end - next_task.duration + 1,
                accumulated_on_time_slots_at_insertion=accumulated_on_time_slots,
                end_exclusive=next_task.end + 1,
            ),
        )

    return accumulated_on_time_slots

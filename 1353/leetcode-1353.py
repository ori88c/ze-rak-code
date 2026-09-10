"""
Copyright (c) 2026 https://github.com/ori88c/
All rights reserved.

This code may NOT be copied, modified, or translated to other languages.
For self-study purposes only.

See LICENSE file or visit https://github.com/ori88c/ for full terms.
"""

from heapq import heappush, heappop
from typing import NamedTuple


class Event(NamedTuple):
    """An event that can be attended on any day in [start, end].

    NamedTuple comparison compares fields in declaration order.
    `start` is declared before `end`, so sorting and ordering are by start,
    then by end.

    Attributes:
        start: First day the event can be attended.
        end: Last day the event can be attended.
    """

    start: int
    end: int


class MinHeapElement(NamedTuple):
    """A heap entry for an event overlapping the current day.

    The min-heap is keyed by `end` so the earliest-ending event is chosen first.

    Note: a real-life solution in which we also return a mapping from event to
    attended day would require storing the original index of the event. In the
    context of this problem, it is omitted for brevity.

    Attributes:
        end: Last day this event can be attended.
    """

    end: int


def get_max_attendable_events(events: list[Event]) -> int:
    """LeetCode 1353: Maximum Number of Events That Can Be Attended.

    Given events [start, end], maximize how many events you can attend. Each
    event can be attended on any day within its interval, but you can attend
    only one event per day.

    Full proof and detailed reasoning: see 1353/README.md.

    Proof outline (short):
        1) Sort events by ascending start.
        2) Iterate days in ascending order.
        3) Maintain a min-heap of overlapping events keyed by end; add all
           events that start at curr_day.
        4) Evict heap entries with end < curr_day.
        5) Allocate exactly one event per day (the smallest end), then
           advance curr_day.
        6) If the heap is empty, jump curr_day to the next event start
           (skips gaps).

        Edge case motivating step 5: [1,10], [1,10], [2,2] — if multiple
        allocations were done in one loop pass, [2,2] could be skipped
        before it is added. One allocation per iteration ensures the tight
        interval is chosen when curr_day = 2.

    Comment philosophy:
        Comments are generally discouraged; the code should be
        self-explanatory. Here they focus on reasoning/proof (the "why"),
        not restating the "what".

    Complexity:
        Time: O(n log n) - Sorting dominates; each event is pushed and
            popped from the heap at most once.
        Space: O(n) - For the sorted events and the heap of overlapping
            events.

    Args:
        events: Input events, each with start and end days.

    Returns:
        The maximum number of attendable events (one day per event).
    """
    if not events:
        return 0

    events_asc_by_start = sorted(events)

    attended_events = 0

    # Min-heap of events overlapping curr_day, prioritized by earliest end.
    # If we needed event->day mapping, we would store indices as well.
    overlapping_events: list[MinHeapElement] = []

    event_i = 0
    # Monotonic; guarantees unique day assignments per event.
    curr_day = events_asc_by_start[0].start

    while event_i < len(events_asc_by_start) or overlapping_events:
        while overlapping_events and overlapping_events[0].end < curr_day:
            heappop(overlapping_events)

        # If the heap is empty, jump to the next event start.
        # Relevant when there’s a gap (e.g., [1,10],[4,5]): after processing
        # [1,10], curr_day = 2 doesn’t overlap [4,5], so we jump to the next
        # start.
        if not overlapping_events and event_i < len(events_asc_by_start):
            curr_day = events_asc_by_start[event_i].start

        while (
            event_i < len(events_asc_by_start)
            and events_asc_by_start[event_i].start == curr_day
        ):
            heappush(
                overlapping_events,
                MinHeapElement(events_asc_by_start[event_i].end),
            )
            event_i += 1

        # Allocate at most one event for curr_day (earliest end wins).
        # Do not be tempted to convert this `if` to a `while`: multiple
        # allocations per pass can skip tight intervals
        # (see [1,10],[1,10],[2,2]).
        if overlapping_events:
            # In a real-world scenario, you’d also record which event was
            # assigned to curr_day.
            heappop(overlapping_events)
            attended_events += 1
            curr_day += 1

    return attended_events

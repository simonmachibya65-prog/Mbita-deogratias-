import type { Event } from "@prisma/client";

interface SeparatedEvents {
  upcoming: Event[];
  past: Event[];
}

/**
 * Separate events into upcoming and past partitions based on a reference date.
 * Events with a date strictly after `now` are considered upcoming.
 * Events with a date on or before `now` are considered past.
 * Returns an object with `upcoming` and `past` arrays, each sorted by date.
 */
export function separateEvents(events: Event[], now: Date): SeparatedEvents {
  const upcoming: Event[] = [];
  const past: Event[] = [];

  for (const event of events) {
    if (event.date > now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  // Sort upcoming ascending (soonest first), past descending (most recent first)
  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  past.sort((a, b) => b.date.getTime() - a.date.getTime());

  return { upcoming, past };
}

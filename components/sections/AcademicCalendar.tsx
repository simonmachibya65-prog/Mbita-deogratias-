"use client";

interface CalendarEvent {
  title: string;
  day: string;
  time: string;
  room?: string;
  color?: string;
}

interface AcademicCalendarProps {
  events: CalendarEvent[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
];

export default function AcademicCalendar({ events }: AcademicCalendarProps) {
  // Assign colors to unique courses
  const courseColors: Record<string, string> = {};
  let colorIdx = 0;
  events.forEach((e) => {
    if (!courseColors[e.title]) {
      courseColors[e.title] = e.color ?? COLORS[colorIdx % COLORS.length];
      colorIdx++;
    }
  });

  const getEventsForSlot = (day: string, hour: string) =>
    events.filter((e) => {
      const dayMatch = e.day.toLowerCase().includes(day.toLowerCase().slice(0, 3));
      const timeMatch = e.time.startsWith(hour);
      return dayMatch && timeMatch;
    });

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-sm" role="grid" aria-label="Weekly course schedule">
        <thead>
          <tr className="bg-navy-50">
            <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-navy-500 uppercase tracking-wide border-b border-border">
              Time
            </th>
            {DAYS.map((day) => (
              <th key={day} className="px-3 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wide border-b border-border">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour, hi) => (
            <tr key={hour} className={hi % 2 === 0 ? "bg-white" : "bg-navy-50/30"}>
              <td className="px-3 py-2 text-xs text-navy-400 font-mono border-b border-border/50 align-top">
                {hour}
              </td>
              {DAYS.map((day) => {
                const slotEvents = getEventsForSlot(day, hour);
                return (
                  <td key={day} className="px-2 py-1.5 border-b border-border/50 align-top min-h-[48px]">
                    {slotEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`rounded-lg px-2 py-1.5 mb-1 border text-xs font-medium ${courseColors[ev.title] ?? COLORS[0]}`}
                      >
                        <p className="font-semibold truncate">{ev.title}</p>
                        {ev.room && <p className="opacity-75 truncate">{ev.room}</p>}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { SectionCard } from "@/components/SectionCard";
import { type DashboardEvent } from "@/lib/dashboardTypes";

export function EventsToday(props: { events: DashboardEvent[] }) {
  return (
    <SectionCard
      title="Today’s Activities"
      rightSlot={<span className="rounded-full border-2 border-black bg-white px-3 py-1">{props.events.length} events</span>}
    >
      {props.events.length === 0 ? (
        <div className="text-xl font-semibold">No events scheduled today.</div>
      ) : (
        <ul className="space-y-3">
          {props.events.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border-2 border-black bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div className="text-2xl font-extrabold">{e.title}</div>
                <div className="text-2xl font-black">{e.time}</div>
              </div>
              {e.location ? (
                <div className="mt-1 text-xl font-bold text-black/80">
                  Location: {e.location}
                </div>
              ) : null}
              {e.description ? (
                <div className="mt-1 text-xl text-black/80">{e.description}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}


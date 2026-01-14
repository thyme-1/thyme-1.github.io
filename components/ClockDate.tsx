import { useEffect, useMemo, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ClockDate(props: { timezone?: string }) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const display = useMemo(() => {
    // For MVP: show local device time; timezone in JSON is for future backend support.
    // If you need timezone-accurate rendering, consider luxon/date-fns-tz later.
    return {
      time: formatTime(now),
      date: formatDate(now),
    };
  }, [now]);

  return (
    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <div className="text-6xl font-black tracking-tight text-black">
        {display.time}
      </div>
      <div className="text-2xl font-bold text-black/80">{display.date}</div>
    </div>
  );
}


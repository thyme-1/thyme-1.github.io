import { useEffect, useMemo, useState } from "react";
import { type DashboardPhoto } from "@/lib/dashboardTypes";

export function PhotoCarousel(props: {
  photos: DashboardPhoto[];
  autoAdvanceMs?: number;
  theme: "light" | "dark";
}) {
  const photos = props.photos ?? [];
  const [idx, setIdx] = useState(0);

  const active = useMemo(() => {
    if (photos.length === 0) return null;
    const i = ((idx % photos.length) + photos.length) % photos.length;
    return { photo: photos[i], i };
  }, [idx, photos]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const ms = props.autoAdvanceMs ?? 8000;
    const t = window.setInterval(() => setIdx((i) => i + 1), ms);
    return () => window.clearInterval(t);
  }, [photos.length, props.autoAdvanceMs]);

  if (!active) return null;

  const buttonClasses =
    props.theme === "dark"
      ? "border-white/20 bg-white/10 text-white"
      : "border-slate-200 bg-white text-slate-900";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-black/5">
        <div className="aspect-[16/7] w-full">
          <img
            key={active.photo.src}
            src={active.photo.src}
            alt={active.photo.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div
          className={
            props.theme === "dark"
              ? "px-6 py-4 text-2xl font-semibold text-slate-200/85"
              : "px-6 py-4 text-2xl font-semibold text-slate-700"
          }
        >
          {active.photo.alt}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIdx((i) => i - 1)}
            className={[
              "rounded-2xl border px-5 py-3 text-xl font-extrabold",
              "transition active:scale-[0.99]",
              buttonClasses,
            ].join(" ")}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => i + 1)}
            className={[
              "rounded-2xl border px-5 py-3 text-xl font-extrabold",
              "transition active:scale-[0.99]",
              buttonClasses,
            ].join(" ")}
          >
            Next
          </button>
        </div>
        <div
          className={
            props.theme === "dark"
              ? "text-xl font-bold text-slate-200/80"
              : "text-xl font-bold text-slate-700"
          }
        >
          {active.i + 1} / {photos.length}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((p, i) => (
          <button
            key={p.src + i}
            type="button"
            onClick={() => setIdx(i)}
            className={[
              "overflow-hidden rounded-2xl border transition active:scale-[0.99]",
              i === active.i
                ? props.theme === "dark"
                  ? "border-amber-300/60"
                  : "border-amber-400"
                : props.theme === "dark"
                  ? "border-white/15"
                  : "border-slate-200",
            ].join(" ")}
            aria-label={`Show photo ${i + 1}`}
          >
            <div className="aspect-[16/10] w-full bg-black/5">
              <img src={p.src} alt={p.alt} className="h-full w-full object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


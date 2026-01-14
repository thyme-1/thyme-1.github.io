import type { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ClockDate } from "@/components/ClockDate";
import { DashboardCard } from "@/components/DashboardCard";
import { FocusOverlay } from "@/components/FocusOverlay";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import {
  type DashboardData,
  isDashboardData,
} from "@/lib/dashboardTypes";
import { loadDashboardOverrides } from "@/lib/storage";
import {
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
  getTimeOfDay,
  resolveThemeMode,
  timeOfDayGradientClasses,
} from "@/lib/theme";
import baseDashboard from "@/data/dashboard.json";

type Props = { initial: DashboardData };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const initial = baseDashboard as DashboardData;
  return { props: { initial } };
};

export default function Home(props: Props) {
  const [override, setOverride] = useState<DashboardData | null>(null);
  const [focused, setFocused] = useState<
    "time" | "meals" | "events" | "announcements" | "familyPhotos" | null
  >(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const local = loadDashboardOverrides();
    if (local) setOverride(local);
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(THEME_MODE_STORAGE_KEY) : null;
    if (saved === "auto" || saved === "light" || saved === "dark") setThemeMode(saved);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const data = useMemo(() => {
    if (override && isDashboardData(override)) return override;
    return props.initial;
  }, [override, props.initial]);

  const timeOfDay = useMemo(() => getTimeOfDay(now), [now]);
  const theme = useMemo(() => resolveThemeMode(themeMode, now), [themeMode, now]);

  const announcements = data.today.announcements ?? [];
  const familyPhotos = data.today.familyPhotos ?? data.today.photos ?? [];

  const cardText =
    theme === "dark" ? "text-slate-50" : "text-slate-900";
  const cardSubText =
    theme === "dark" ? "text-slate-200/80" : "text-slate-600";
  const cardBg =
    theme === "dark"
      ? "bg-slate-950/55 border-white/15"
      : "bg-white/80 border-white/35";

  return (
    <>
      <Head>
        <title>{data.home.name} • Resident Dashboard</title>
        <meta
          name="description"
          content="Resident-facing dashboard prototype for senior living communities."
        />
      </Head>
      <div
        className={[
          "min-h-screen px-4 py-6 sm:px-8",
          timeOfDayGradientClasses(timeOfDay, theme),
          theme === "dark" ? "text-slate-50" : "text-slate-900",
        ].join(" ")}
      >
        <main className="mx-auto w-full max-w-6xl">
          <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-4xl font-black tracking-tight">
                {data.home.name}
              </div>
              <div className={["mt-2 text-xl font-semibold", theme === "dark" ? "text-slate-200/80" : "text-slate-700"].join(" ")}>
                Tap any card to focus.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={[
                  "flex overflow-hidden rounded-2xl border",
                  theme === "dark" ? "border-white/15 bg-white/10" : "border-white/30 bg-white/60",
                  "backdrop-blur",
                ].join(" ")}
                role="group"
                aria-label="Theme toggle"
              >
                {(["auto", "light", "dark"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setThemeMode(m)}
                    className={[
                      "px-4 py-3 text-lg font-extrabold transition",
                      "active:scale-[0.99]",
                      themeMode === m
                        ? theme === "dark"
                          ? "bg-white/15"
                          : "bg-white"
                        : "bg-transparent",
                    ].join(" ")}
                  >
                    {m === "auto" ? "Auto" : m === "light" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>

              <a
                className={[
                  "rounded-2xl border px-5 py-3 text-lg font-extrabold",
                  "transition active:scale-[0.99]",
                  theme === "dark"
                    ? "border-white/15 bg-white/10"
                    : "border-white/30 bg-white/60",
                  "backdrop-blur",
                ].join(" ")}
                href="/admin"
              >
                Admin
              </a>
            </div>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <DashboardCard
              title="Time & Date"
              subtitle="Always up-to-date"
              theme={theme}
              onFocus={() => setFocused("time")}
              focusHint="Tap to focus"
            >
              <div className={[cardBg, "rounded-2xl border p-5"].join(" ")}>
                <div className={cardText}>
                  <ClockDate timezone={data.home.timezone} />
                </div>
              </div>
              <div className={["mt-4 text-lg font-semibold", cardSubText].join(" ")}>
                In focus mode, the clock is extra large for across-the-room viewing.
              </div>
            </DashboardCard>

            <DashboardCard
              title="Meals"
              subtitle="Breakfast • Lunch • Dinner"
              theme={theme}
              onFocus={() => setFocused("meals")}
              focusHint="Tap to focus"
            >
              <div className={[cardBg, "rounded-2xl border p-5"].join(" ")}>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      ["Breakfast", data.today.meals.breakfast],
                      ["Lunch", data.today.meals.lunch],
                      ["Dinner", data.today.meals.dinner],
                    ] as const
                  ).map(([label, text]) => (
                    <div
                      key={label}
                      className={[
                        "rounded-2xl border p-4",
                        theme === "dark" ? "border-white/15 bg-white/5" : "border-white/35 bg-white/70",
                      ].join(" ")}
                    >
                      <div className={["text-xl font-black", cardText].join(" ")}>
                        {label}
                      </div>
                      <div className={["mt-2 text-lg font-semibold leading-relaxed", cardSubText].join(" ")}>
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Events"
              subtitle="What’s happening today"
              theme={theme}
              onFocus={() => setFocused("events")}
              focusHint="Tap to focus"
            >
              <div className={[cardBg, "rounded-2xl border p-5"].join(" ")}>
                {data.today.events.length === 0 ? (
                  <div className={["text-xl font-bold", cardSubText].join(" ")}>
                    No events scheduled today.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {data.today.events.slice(0, 3).map((e) => (
                      <li
                        key={e.id}
                        className={[
                          "rounded-2xl border p-4",
                          theme === "dark" ? "border-white/15 bg-white/5" : "border-white/35 bg-white/70",
                        ].join(" ")}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                          <div className={["text-2xl font-black", cardText].join(" ")}>{e.title}</div>
                          <div className={["text-2xl font-black", cardText].join(" ")}>{e.time}</div>
                        </div>
                        {e.location ? (
                          <div className={["mt-1 text-lg font-semibold", cardSubText].join(" ")}>
                            {e.location}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={["mt-4 text-lg font-semibold", cardSubText].join(" ")}>
                Showing up to 3 events here. Tap to see the full list.
              </div>
            </DashboardCard>

            <DashboardCard
              title="Announcements"
              subtitle="Important updates"
              theme={theme}
              onFocus={() => setFocused("announcements")}
              focusHint="Tap to focus"
            >
              <div className={[cardBg, "rounded-2xl border p-5"].join(" ")}>
                {announcements.length === 0 ? (
                  <div className={["text-xl font-bold", cardSubText].join(" ")}>
                    No announcements right now.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {announcements.slice(0, 2).map((a) => (
                      <li
                        key={a.id}
                        className={[
                          "rounded-2xl border p-4",
                          theme === "dark" ? "border-white/15 bg-white/5" : "border-white/35 bg-white/70",
                        ].join(" ")}
                      >
                        <div className={["text-2xl font-black", cardText].join(" ")}>
                          {a.title}
                        </div>
                        <div className={["mt-2 text-lg font-semibold leading-relaxed", cardSubText].join(" ")}>
                          {a.message}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={["mt-4 text-lg font-semibold", cardSubText].join(" ")}>
                Tap to view all announcements.
              </div>
            </DashboardCard>

            <div className="md:col-span-2">
              <DashboardCard
                title="Family Photos"
                subtitle="A warm reminder of home"
                theme={theme}
                onFocus={() => setFocused("familyPhotos")}
                focusHint="Tap to focus"
              >
                <div className={[cardBg, "rounded-2xl border p-5"].join(" ")}>
                  {familyPhotos.length === 0 ? (
                    <div className={["text-xl font-bold", cardSubText].join(" ")}>
                      No photos yet. Add some in /admin.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {familyPhotos.slice(0, 4).map((p) => (
                        <div key={p.src} className="overflow-hidden rounded-2xl border border-white/25 bg-black/5">
                          <div className="aspect-[16/9] w-full">
                            <img src={p.src} alt={p.alt} className="h-full w-full object-cover" />
                          </div>
                          <div className={["px-4 py-3 text-lg font-semibold", cardSubText].join(" ")}>
                            {p.alt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={["mt-4 text-lg font-semibold", cardSubText].join(" ")}>
                  Tap for a full-screen slideshow.
                </div>
              </DashboardCard>
            </div>
          </div>

          <footer className={["mt-8 pb-2 text-center text-lg font-semibold", theme === "dark" ? "text-slate-200/70" : "text-slate-700"].join(" ")}>
            Focus mode: tap a card • Close: tap outside or press Escape
          </footer>
        </main>
      </div>

      <FocusOverlay
        open={focused === "time"}
        title="Time & Date"
        onClose={() => setFocused(null)}
        theme={theme}
      >
        <div className={theme === "dark" ? "text-slate-50" : "text-slate-900"}>
          <div className="text-[92px] font-black leading-none">
            {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </div>
          <div className={theme === "dark" ? "mt-4 text-3xl font-bold text-slate-200/85" : "mt-4 text-3xl font-bold text-slate-700"}>
            {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </FocusOverlay>

      <FocusOverlay
        open={focused === "meals"}
        title="Meals"
        onClose={() => setFocused(null)}
        theme={theme}
      >
        <div className="space-y-5">
          {(
            [
              ["Breakfast", data.today.meals.breakfast],
              ["Lunch", data.today.meals.lunch],
              ["Dinner", data.today.meals.dinner],
            ] as const
          ).map(([label, text]) => (
            <div
              key={label}
              className={[
                "rounded-3xl border p-6",
                theme === "dark" ? "border-white/15 bg-white/5" : "border-slate-200 bg-white/70",
              ].join(" ")}
            >
              <div className="text-3xl font-black">{label}</div>
              <div className={theme === "dark" ? "mt-3 text-2xl text-slate-200/85" : "mt-3 text-2xl text-slate-700"}>
                {text}
              </div>
            </div>
          ))}
        </div>
      </FocusOverlay>

      <FocusOverlay
        open={focused === "events"}
        title="Today’s Events"
        onClose={() => setFocused(null)}
        theme={theme}
      >
        {data.today.events.length === 0 ? (
          <div className={theme === "dark" ? "text-2xl text-slate-200/85" : "text-2xl text-slate-700"}>
            No events scheduled today.
          </div>
        ) : (
          <ul className="space-y-4">
            {data.today.events.map((e) => (
              <li
                key={e.id}
                className={[
                  "rounded-3xl border p-6",
                  theme === "dark" ? "border-white/15 bg-white/5" : "border-slate-200 bg-white/70",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
                  <div className="text-3xl font-black">{e.title}</div>
                  <div className="text-3xl font-black">{e.time}</div>
                </div>
                {e.location ? (
                  <div className={theme === "dark" ? "mt-2 text-2xl font-semibold text-slate-200/85" : "mt-2 text-2xl font-semibold text-slate-700"}>
                    Location: {e.location}
                  </div>
                ) : null}
                {e.description ? (
                  <div className={theme === "dark" ? "mt-2 text-2xl text-slate-200/80" : "mt-2 text-2xl text-slate-700"}>
                    {e.description}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </FocusOverlay>

      <FocusOverlay
        open={focused === "announcements"}
        title="Announcements"
        onClose={() => setFocused(null)}
        theme={theme}
      >
        {announcements.length === 0 ? (
          <div className={theme === "dark" ? "text-2xl text-slate-200/85" : "text-2xl text-slate-700"}>
            No announcements right now.
          </div>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className={[
                  "rounded-3xl border p-6",
                  theme === "dark" ? "border-white/15 bg-white/5" : "border-slate-200 bg-white/70",
                ].join(" ")}
              >
                <div className="text-3xl font-black">{a.title}</div>
                <div className={theme === "dark" ? "mt-3 text-2xl text-slate-200/85" : "mt-3 text-2xl text-slate-700"}>
                  {a.message}
                </div>
              </li>
            ))}
          </ul>
        )}
      </FocusOverlay>

      <FocusOverlay
        open={focused === "familyPhotos"}
        title="Family Photos"
        onClose={() => setFocused(null)}
        theme={theme}
      >
        {familyPhotos.length === 0 ? (
          <div className={theme === "dark" ? "text-2xl text-slate-200/85" : "text-2xl text-slate-700"}>
            No photos yet. Add some in /admin.
          </div>
        ) : (
          <PhotoCarousel photos={familyPhotos} theme={theme} autoAdvanceMs={9000} />
        )}
      </FocusOverlay>
    </>
  );
}

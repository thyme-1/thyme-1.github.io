import type { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClockDate } from "@/components/ClockDate";
import { DashboardCard } from "@/components/DashboardCard";
import { AmbientBackground } from "@/components/AmbientBackground";
import { FullscreenFocus } from "@/components/FullscreenFocus";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import {
  type DashboardData,
  isDashboardData,
} from "@/lib/dashboardTypes";
import { getAmbientPalette } from "@/lib/ambient";
import { useDashboardOverrides } from "@/lib/useLocalStorage";
import baseDashboard from "@/data/dashboard.json";

type Props = { initial: DashboardData };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const initial = baseDashboard as DashboardData;
  return { props: { initial } };
};

export default function Home(props: Props) {
  const override = useDashboardOverrides();
  const [view, setView] = useState<
    "dashboard" | "time" | "meals" | "events" | "announcements" | "photos" | "frame"
  >("dashboard");
  const [now, setNow] = useState<Date>(() => new Date());
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    // Update time frequently so gradient can drift smoothly.
    const t = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(t);
  }, []);

  const data = useMemo(() => {
    if (override && isDashboardData(override)) return override;
    return props.initial;
  }, [override, props.initial]);

  const announcements = data.today.announcements ?? [];
  const familyPhotos = data.today.familyPhotos ?? data.today.photos ?? [];

  useEffect(() => {
    if (familyPhotos.length <= 1) return;
    const t = window.setInterval(() => {
      setPhotoIndex((i) => (i + 1) % familyPhotos.length);
    }, 18000);
    return () => window.clearInterval(t);
  }, [familyPhotos.length]);

  const activePhoto = familyPhotos.length > 0 ? familyPhotos[photoIndex % familyPhotos.length] : null;
  const palette = useMemo(() => getAmbientPalette(now), [now]);

  return (
    <>
      <Head>
        <title>{data.home.name} • Resident Dashboard</title>
        <meta
          name="description"
          content="Resident-facing dashboard prototype for senior living communities."
        />
      </Head>
      <div className="relative h-screen w-screen overflow-hidden">
        <AmbientBackground
          photoSrc={activePhoto?.src ?? null}
          palette={palette}
          photoPriority={view === "frame"}
        />

        {/* Main dashboard (edge-to-edge) */}
        {view === "dashboard" ? (
          <div className="relative z-10 h-full w-full">
            <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {data.home.name}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-white/80">
                    Tap a section to open full-screen.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setView("frame")}
                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-lg font-extrabold text-white backdrop-blur transition active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
                  >
                    Picture Frame
                  </button>
                  <Link
                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-lg font-extrabold text-white backdrop-blur transition active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
                    href="/admin"
                  >
                    Admin
                  </Link>
                </div>
              </header>

              <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-6">
                {/* Time (top-left) */}
                <div className="lg:col-span-4 lg:row-span-2">
                  <DashboardCard
                    title="Time & Date"
                    subtitle="Always visible"
                    accent="sky"
                    onFocus={() => setView("time")}
                    focusHint="Tap"
                  >
                    <div className="rounded-2xl border border-white/20 bg-black/10 p-5">
                      <div className="text-white">
                        <ClockDate timezone={data.home.timezone} />
                      </div>
                      <div className="mt-3 text-lg font-semibold text-white/80">
                        For TVs, open full-screen to make it extra large.
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                {/* Meals (top-middle) */}
                <div className="lg:col-span-4 lg:row-span-2">
                  <DashboardCard
                    title="Meals"
                    subtitle="Breakfast • Lunch • Dinner"
                    accent="amber"
                    onFocus={() => setView("meals")}
                    focusHint="Tap"
                  >
                    <div className="grid gap-3 rounded-2xl border border-white/20 bg-black/10 p-5 sm:grid-cols-3">
                      {(
                        [
                          ["Breakfast", data.today.meals.breakfast],
                          ["Lunch", data.today.meals.lunch],
                          ["Dinner", data.today.meals.dinner],
                        ] as const
                      ).map(([label, text]) => (
                        <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                          <div className="text-xl font-black text-white">{label}</div>
                          <div className="mt-2 text-lg font-semibold leading-relaxed text-white/85">
                            {text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                </div>

                {/* Announcements (top-right) */}
                <div className="lg:col-span-4 lg:row-span-2">
                  <DashboardCard
                    title="Announcements"
                    subtitle="Important updates"
                    accent="violet"
                    onFocus={() => setView("announcements")}
                    focusHint="Tap"
                  >
                    <div className="rounded-2xl border border-white/20 bg-black/10 p-5">
                      {announcements.length === 0 ? (
                        <div className="text-xl font-bold text-white/85">No announcements right now.</div>
                      ) : (
                        <ul className="space-y-3">
                          {announcements.slice(0, 2).map((a) => (
                            <li key={a.id} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                              <div className="text-2xl font-black text-white">{a.title}</div>
                              <div className="mt-2 text-lg font-semibold leading-relaxed text-white/85">
                                {a.message}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </DashboardCard>
                </div>

                {/* Events (left, tall) */}
                <div className="lg:col-span-6 lg:row-span-4">
                  <DashboardCard
                    title="Events"
                    subtitle="Today’s schedule"
                    accent="emerald"
                    onFocus={() => setView("events")}
                    focusHint="Tap"
                  >
                    <div className="h-full rounded-2xl border border-white/20 bg-black/10 p-5">
                      {data.today.events.length === 0 ? (
                        <div className="text-xl font-bold text-white/85">No events scheduled today.</div>
                      ) : (
                        <ul className="space-y-3">
                          {data.today.events.slice(0, 5).map((e) => (
                            <li key={e.id} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                                <div className="text-2xl font-black text-white">{e.title}</div>
                                <div className="text-2xl font-black text-white">{e.time}</div>
                              </div>
                              {e.location ? (
                                <div className="mt-1 text-lg font-semibold text-white/80">{e.location}</div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4 text-lg font-semibold text-white/75">
                        Tap to open a full-screen view.
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                {/* Photos (right, primary) */}
                <div className="lg:col-span-6 lg:row-span-4">
                  <DashboardCard
                    title="Family Photos"
                    subtitle="A warm reminder of home"
                    accent="rose"
                    onFocus={() => setView("photos")}
                    focusHint="Tap"
                  >
                    <div className="rounded-2xl border border-white/20 bg-black/10 p-5">
                      {activePhoto ? (
                        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/10">
                          <div className="aspect-[16/8] w-full">
                            <img
                              src={activePhoto.src}
                              alt={activePhoto.alt}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="px-5 py-4 text-xl font-semibold text-white/90">
                            {activePhoto.alt}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-white/85">
                          No photos yet. Add some in /admin.
                        </div>
                      )}
                      <div className="mt-4 text-lg font-semibold text-white/75">
                        Photos are also used as the calming background.
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Full-screen focus views (not floating modals) */}
        <FullscreenFocus
          open={view === "time"}
          title="Time & Date"
          onClose={() => setView("dashboard")}
        >
          <div className="flex h-full min-h-[70vh] flex-col items-center justify-center text-center">
            <div className="text-[110px] font-black leading-none text-white sm:text-[160px]">
              {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
            <div className="mt-6 text-3xl font-bold text-white/85 sm:text-4xl">
              {now.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </FullscreenFocus>

        <FullscreenFocus
          open={view === "meals"}
          title="Meals"
          onClose={() => setView("dashboard")}
        >
          <div className="mx-auto grid max-w-4xl gap-5">
            {(
              [
                ["Breakfast", data.today.meals.breakfast],
                ["Lunch", data.today.meals.lunch],
                ["Dinner", data.today.meals.dinner],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div className="text-4xl font-black text-white">{label}</div>
                <div className="mt-4 text-2xl font-semibold leading-relaxed text-white/85">
                  {text}
                </div>
              </div>
            ))}
          </div>
        </FullscreenFocus>

        <FullscreenFocus
          open={view === "events"}
          title="Today’s Events"
          onClose={() => setView("dashboard")}
        >
          {data.today.events.length === 0 ? (
            <div className="text-2xl font-semibold text-white/85">No events scheduled today.</div>
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-4">
              {data.today.events.map((e) => (
                <div key={e.id} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
                    <div className="text-4xl font-black text-white">{e.title}</div>
                    <div className="text-4xl font-black text-white">{e.time}</div>
                  </div>
                  {e.location ? (
                    <div className="mt-2 text-2xl font-semibold text-white/85">
                      Location: {e.location}
                    </div>
                  ) : null}
                  {e.description ? (
                    <div className="mt-3 text-2xl leading-relaxed text-white/80">
                      {e.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </FullscreenFocus>

        <FullscreenFocus
          open={view === "announcements"}
          title="Announcements"
          onClose={() => setView("dashboard")}
        >
          {announcements.length === 0 ? (
            <div className="text-2xl font-semibold text-white/85">No announcements right now.</div>
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                  <div className="text-4xl font-black text-white">{a.title}</div>
                  <div className="mt-4 text-2xl font-semibold leading-relaxed text-white/85">
                    {a.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FullscreenFocus>

        <FullscreenFocus
          open={view === "photos"}
          title="Family Photos"
          onClose={() => setView("dashboard")}
          rightActions={
            <button
              type="button"
              onClick={() => setView("frame")}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xl font-extrabold text-white backdrop-blur transition active:scale-[0.99]"
            >
              Frame Mode
            </button>
          }
        >
          {familyPhotos.length === 0 ? (
            <div className="text-2xl font-semibold text-white/85">No photos yet. Add some in /admin.</div>
          ) : (
            <div className="mx-auto w-full max-w-6xl">
              {/* PhotoCarousel already includes touch-first controls */}
              <PhotoCarousel photos={familyPhotos} theme={"dark"} autoAdvanceMs={9000} />
            </div>
          )}
        </FullscreenFocus>

        {/* Picture-frame mode: full-screen photo + gentle controls */}
        <FullscreenFocus
          open={view === "frame"}
          title="Picture Frame"
          onClose={() => setView("dashboard")}
          chrome={false}
        >
          <div className="relative h-full min-h-[85vh] w-full">
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-4 sm:left-8 sm:right-8">
              <button
                type="button"
                onClick={() => setView("dashboard")}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xl font-extrabold text-white backdrop-blur transition active:scale-[0.99]"
              >
                Dashboard
              </button>
              <div className="rounded-2xl border border-white/15 bg-black/15 px-5 py-3 text-2xl font-black text-white backdrop-blur">
                {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
            <div className="flex h-full w-full items-end">
              <div className="w-full px-4 pb-6 sm:px-8">
                <div className="max-w-3xl rounded-3xl border border-white/15 bg-black/20 p-5 text-2xl font-semibold text-white/90 backdrop-blur">
                  {activePhoto?.alt ?? "Family Photos"}
                </div>
              </div>
            </div>
          </div>
        </FullscreenFocus>
      </div>
    </>
  );
}

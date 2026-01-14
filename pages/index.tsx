import type { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ClockDate } from "@/components/ClockDate";
import { EventsToday } from "@/components/EventsToday";
import { MealsToday } from "@/components/MealsToday";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import {
  type DashboardData,
  isDashboardData,
} from "@/lib/dashboardTypes";
import { loadDashboardOverrides } from "@/lib/storage";
import baseDashboard from "@/data/dashboard.json";

type Props = { initial: DashboardData };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const initial = baseDashboard as DashboardData;
  return { props: { initial } };
};

export default function Home(props: Props) {
  const [override, setOverride] = useState<DashboardData | null>(null);

  useEffect(() => {
    const local = loadDashboardOverrides();
    if (local) setOverride(local);
  }, []);

  const data = useMemo(() => {
    if (override && isDashboardData(override)) return override;
    return props.initial;
  }, [override, props.initial]);

  return (
    <>
      <Head>
        <title>{data.home.name} • Resident Dashboard</title>
        <meta
          name="description"
          content="Resident-facing dashboard prototype for senior living communities."
        />
      </Head>
      <div className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#f8fafc_40%,#f1f5f9_100%)] px-4 py-6 sm:px-8">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:flex-row">
            <div>
              <div className="text-3xl font-black tracking-tight text-black">
                {data.home.name}
              </div>
              <div className="mt-1 text-xl font-semibold text-black/70">
                Resident Dashboard
              </div>
            </div>
            <ClockDate timezone={data.home.timezone} />
          </header>

          <MealsToday meals={data.today.meals} />
          <EventsToday events={data.today.events} />
          <PhotoSlideshow photos={data.today.photos} />

          <footer className="pb-2 text-center text-lg font-semibold text-black/60">
            Tip: Staff can edit today’s content at{" "}
            <a className="underline decoration-2" href="/admin">
              /admin
            </a>
            .
          </footer>
        </main>
      </div>
    </>
  );
}

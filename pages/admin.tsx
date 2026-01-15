import Head from "next/head";
import type { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import baseDashboard from "@/data/dashboard.json";
import {
  type DashboardData,
  type DashboardAnnouncement,
  type DashboardEvent,
  type DashboardPhoto,
  isDashboardData,
} from "@/lib/dashboardTypes";
import {
  clearDashboardOverrides,
  endAdminSession,
  isAdminSessionActive,
  loadDashboardOverrides,
  saveDashboardOverrides,
  startAdminSession,
} from "@/lib/storage";

type Props = { initial: DashboardData };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const initial = baseDashboard as DashboardData;
  return { props: { initial } };
};

async function verifyPassword(password: string): Promise<boolean> {
  const res = await fetch("/api/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function AdminPageImpl(props: Props) {
  const initialLocal = loadDashboardOverrides();
  const initialFromLocal =
    initialLocal && isDashboardData(initialLocal) ? initialLocal : null;

  const [authed, setAuthed] = useState(() => isAdminSessionActive());
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(() =>
    initialFromLocal ? "Using local edits (localStorage)" : "Using base JSON",
  );

  const [draft, setDraft] = useState<DashboardData>(
    () => initialFromLocal ?? props.initial,
  );

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const ok = await verifyPassword(password);
      if (!ok) {
        setError("Incorrect password.");
        return;
      }
      startAdminSession(8);
      setAuthed(true);
      setPassword("");
    } catch {
      setError("Could not verify password. Is the site deployed with API support?");
    }
  }

  function updateMeals(key: "breakfast" | "lunch" | "dinner", value: string) {
    setDraft((d) => ({
      ...d,
      today: { ...d.today, meals: { ...d.today.meals, [key]: value } },
    }));
  }

  function updateEvent(id: string, patch: Partial<DashboardEvent>) {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        events: d.today.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
      },
    }));
  }

  function addEvent() {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        events: [
          ...d.today.events,
          { id: newId("event"), time: "6:00 PM", title: "New Event", location: "", description: "" },
        ],
      },
    }));
  }

  function removeEvent(id: string) {
    setDraft((d) => ({
      ...d,
      today: { ...d.today, events: d.today.events.filter((ev) => ev.id !== id) },
    }));
  }

  function updateAnnouncement(id: string, patch: Partial<DashboardAnnouncement>) {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        announcements: (d.today.announcements ?? []).map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      },
    }));
  }

  function addAnnouncement() {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        announcements: [
          ...(d.today.announcements ?? []),
          {
            id: newId("announcement"),
            title: "New Announcement",
            message: "Message...",
          },
        ],
      },
    }));
  }

  function removeAnnouncement(id: string) {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        announcements: (d.today.announcements ?? []).filter((a) => a.id !== id),
      },
    }));
  }

  function updateFamilyPhoto(idOrSrc: string, patch: Partial<DashboardPhoto>) {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        familyPhotos: (d.today.familyPhotos ?? d.today.photos ?? []).map((ph) =>
          ph.src === idOrSrc ? { ...ph, ...patch } : ph,
        ),
      },
    }));
  }

  function addFamilyPhoto() {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        familyPhotos: [
          ...(d.today.familyPhotos ?? d.today.photos ?? []),
          { src: "/photos/01-garden.svg", alt: "New photo" },
        ],
      },
    }));
  }

  function removeFamilyPhoto(src: string) {
    setDraft((d) => ({
      ...d,
      today: {
        ...d.today,
        familyPhotos: (d.today.familyPhotos ?? d.today.photos ?? []).filter(
          (ph) => ph.src !== src,
        ),
      },
    }));
  }

  function save() {
    // Keep legacy `photos` in sync so older frontends (or existing saved data) still work.
    const synced: DashboardData = {
      ...draft,
      today: {
        ...draft.today,
        photos: draft.today.familyPhotos ?? draft.today.photos,
        announcements: draft.today.announcements ?? [],
      },
    };
    saveDashboardOverrides(synced);
    setStatusText("Using local edits (localStorage)");
    setError(null);
    alert("Saved! The dashboard will now use your local edits on this device/browser.");
  }

  function resetToBase() {
    if (!confirm("Clear local edits and return to the base JSON?")) return;
    clearDashboardOverrides();
    setDraft(props.initial);
    setStatusText("Using base JSON");
  }

  function logout() {
    endAdminSession();
    setAuthed(false);
  }

  return (
    <>
      <Head>
        <title>Admin • Resident Dashboard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 px-4 py-8 sm:px-8">
        <main className="mx-auto w-full max-w-6xl">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-black">
                  Admin Editor
                </h1>
                <p className="mt-2 text-xl font-semibold text-slate-700">
                  Edit meals, activities, announcements, and family photos (saved to localStorage).
                </p>
              </div>
              <div className="text-lg font-bold text-slate-700">{statusText}</div>
            </div>
          </header>

          {!authed ? (
            <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
              <h2 className="text-2xl font-extrabold text-slate-900">Enter Admin Password</h2>
              <p className="mt-2 text-lg font-semibold text-slate-700">
                Password is set via <code className="font-black">ADMIN_PASSWORD</code>{" "}
                in <code className="font-black">.env.local</code> (locally) or the hosting provider env settings.
              </p>
              <form onSubmit={onLogin} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex w-full flex-col gap-2">
                  <span className="text-lg font-bold text-slate-800">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-xl font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                    placeholder="Enter password"
                    autoFocus
                  />
                </label>
                <button
                  type="submit"
                  className="h-14 rounded-2xl border border-slate-300 bg-slate-900 px-6 text-xl font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                >
                  Unlock
                </button>
              </form>
              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-lg font-bold text-red-700">
                  {error}
                </div>
              ) : null}
            </section>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black text-slate-900">Today’s Meals</h2>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-black text-slate-900 transition active:scale-[0.99]"
                      href="/"
                    >
                      View Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-black text-slate-900 transition active:scale-[0.99]"
                      type="button"
                    >
                      Lock Admin
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {(["breakfast", "lunch", "dinner"] as const).map((key) => (
                    <label key={key} className="flex flex-col gap-2">
                      <span className="text-lg font-extrabold capitalize text-slate-800">{key}</span>
                      <textarea
                        value={draft.today.meals[key]}
                        onChange={(e) => updateMeals(key, e.target.value)}
                        className="min-h-[120px] resize-y rounded-2xl border border-slate-300 bg-white p-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black text-slate-900">Today’s Activities</h2>
                  <button
                    onClick={addEvent}
                    className="rounded-2xl border border-slate-300 bg-emerald-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                    type="button"
                  >
                    + Add Event
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {draft.today.events.map((ev) => (
                    <div key={ev.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2">
                          <span className="text-lg font-bold text-slate-800">Time</span>
                          <input
                            value={ev.time}
                            onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold text-slate-800">Title</span>
                          <input
                            value={ev.title}
                            onChange={(e) => updateEvent(ev.id, { title: e.target.value })}
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-3">
                          <span className="text-lg font-bold text-slate-800">Location</span>
                          <input
                            value={ev.location ?? ""}
                            onChange={(e) => updateEvent(ev.id, { location: e.target.value })}
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                            placeholder="Optional"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-3">
                          <span className="text-lg font-bold text-slate-800">Description</span>
                          <textarea
                            value={ev.description ?? ""}
                            onChange={(e) => updateEvent(ev.id, { description: e.target.value })}
                            className="min-h-[90px] resize-y rounded-2xl border border-slate-300 bg-white p-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                            placeholder="Optional"
                          />
                        </label>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => removeEvent(ev.id)}
                          className="rounded-2xl border border-slate-300 bg-rose-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black text-slate-900">Family Photos</h2>
                  <button
                    onClick={addFamilyPhoto}
                    className="rounded-2xl border border-slate-300 bg-sky-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                    type="button"
                  >
                    + Add Photo
                  </button>
                </div>

                <p className="mt-3 text-lg font-semibold text-slate-700">
                  Photos should live in <code className="font-black">public/photos/</code>. Use a path like{" "}
                  <code className="font-black">/photos/my-photo.jpg</code>.
                </p>

                <div className="mt-5 space-y-4">
                  {(draft.today.familyPhotos ?? draft.today.photos ?? []).map((ph) => (
                    <div key={ph.src} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold text-slate-800">Image src</span>
                          <input
                            value={ph.src}
                            onChange={(e) => updateFamilyPhoto(ph.src, { src: e.target.value })}
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-lg font-bold text-slate-800">Alt text</span>
                          <input
                            value={ph.alt}
                            onChange={(e) => updateFamilyPhoto(ph.src, { alt: e.target.value })}
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="h-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img src={ph.src} alt={ph.alt} className="h-full w-full object-cover" />
                        </div>
                        <button
                          onClick={() => removeFamilyPhoto(ph.src)}
                          className="rounded-2xl border border-slate-300 bg-rose-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black text-slate-900">Announcements</h2>
                  <button
                    onClick={addAnnouncement}
                    className="rounded-2xl border border-slate-300 bg-violet-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                    type="button"
                  >
                    + Add Announcement
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {(draft.today.announcements ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg font-bold text-slate-700">
                      No announcements yet.
                    </div>
                  ) : null}

                  {(draft.today.announcements ?? []).map((a) => (
                    <div key={a.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2 md:col-span-1">
                          <span className="text-lg font-bold text-slate-800">Title</span>
                          <input
                            value={a.title}
                            onChange={(e) =>
                              updateAnnouncement(a.id, { title: e.target.value })
                            }
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold text-slate-800">Message</span>
                          <input
                            value={a.message}
                            onChange={(e) =>
                              updateAnnouncement(a.id, { message: e.target.value })
                            }
                            className="h-12 rounded-2xl border border-slate-300 bg-white px-3 text-lg font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-amber-200"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => removeAnnouncement(a.id)}
                          className="rounded-2xl border border-slate-300 bg-rose-600 px-5 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black text-slate-900">Save / Reset</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={resetToBase}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-black text-slate-900 transition active:scale-[0.99]"
                      type="button"
                    >
                      Reset to Base
                    </button>
                    <button
                      onClick={save}
                      className="rounded-2xl border border-slate-300 bg-slate-900 px-6 py-3 text-lg font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition active:scale-[0.99]"
                      type="button"
                    >
                      Save to localStorage
                    </button>
                  </div>
                </div>
                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-lg font-bold text-red-700">
                    {error}
                  </div>
                ) : null}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// Admin is demo-only and depends on browser localStorage; avoid SSR/hydration mismatch.
export default dynamic(() => Promise.resolve(AdminPageImpl), { ssr: false });


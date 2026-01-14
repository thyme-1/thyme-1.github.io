import Head from "next/head";
import type { GetStaticProps } from "next";
import { useEffect, useState } from "react";
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

export default function AdminPage(props: Props) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Using base JSON");

  const [draft, setDraft] = useState<DashboardData>(props.initial);

  useEffect(() => {
    const ok = isAdminSessionActive();
    setAuthed(ok);

    const local = loadDashboardOverrides();
    if (local && isDashboardData(local)) setDraft(local);
    else setDraft(props.initial);

    const usingLocal = !!local;
    setStatusText(usingLocal ? "Using local edits (localStorage)" : "Using base JSON");
  }, [props.initial]);

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
    setError(null);
    alert("Saved! The dashboard will now use your local edits on this device/browser.");
  }

  function resetToBase() {
    if (!confirm("Clear local edits and return to the base JSON?")) return;
    clearDashboardOverrides();
    setDraft(props.initial);
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

      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
        <main className="mx-auto w-full max-w-5xl">
          <header className="mb-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-black">
                  Admin Editor
                </h1>
                <p className="mt-1 text-xl font-semibold text-black/70">
                  Edit meals, activities, announcements, and family photos (saved to localStorage).
                </p>
              </div>
              <div className="text-lg font-bold text-black/70">{statusText}</div>
            </div>
          </header>

          {!authed ? (
            <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-extrabold">Enter Admin Password</h2>
              <p className="mt-2 text-lg text-black/70">
                Password is set via <code className="font-black">ADMIN_PASSWORD</code>{" "}
                in <code className="font-black">.env.local</code> (locally) or the hosting provider env settings.
              </p>
              <form onSubmit={onLogin} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex w-full flex-col gap-2">
                  <span className="text-lg font-bold">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-xl border-2 border-black px-4 text-xl font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                    placeholder="Enter password"
                    autoFocus
                  />
                </label>
                <button
                  type="submit"
                  className="h-14 rounded-xl border-2 border-black bg-yellow-300 px-6 text-xl font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-yellow-200"
                >
                  Unlock
                </button>
              </form>
              {error ? (
                <div className="mt-4 rounded-xl border-2 border-red-600 bg-red-50 p-4 text-lg font-bold text-red-700">
                  {error}
                </div>
              ) : null}
            </section>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black">Today’s Meals</h2>
                  <div className="flex flex-wrap gap-3">
                    <a
                      className="rounded-xl border-2 border-black bg-white px-5 py-3 text-lg font-black hover:bg-slate-50"
                      href="/"
                    >
                      View Dashboard
                    </a>
                    <button
                      onClick={logout}
                      className="rounded-xl border-2 border-black bg-white px-5 py-3 text-lg font-black hover:bg-slate-50"
                      type="button"
                    >
                      Lock Admin
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {(["breakfast", "lunch", "dinner"] as const).map((key) => (
                    <label key={key} className="flex flex-col gap-2">
                      <span className="text-lg font-extrabold capitalize">{key}</span>
                      <textarea
                        value={draft.today.meals[key]}
                        onChange={(e) => updateMeals(key, e.target.value)}
                        className="min-h-[120px] resize-y rounded-xl border-2 border-black p-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black">Today’s Activities</h2>
                  <button
                    onClick={addEvent}
                    className="rounded-xl border-2 border-black bg-green-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-green-100"
                    type="button"
                  >
                    + Add Event
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {draft.today.events.map((ev) => (
                    <div key={ev.id} className="rounded-2xl border-2 border-black bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2">
                          <span className="text-lg font-bold">Time</span>
                          <input
                            value={ev.time}
                            onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold">Title</span>
                          <input
                            value={ev.title}
                            onChange={(e) => updateEvent(ev.id, { title: e.target.value })}
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-3">
                          <span className="text-lg font-bold">Location</span>
                          <input
                            value={ev.location ?? ""}
                            onChange={(e) => updateEvent(ev.id, { location: e.target.value })}
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                            placeholder="Optional"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-3">
                          <span className="text-lg font-bold">Description</span>
                          <textarea
                            value={ev.description ?? ""}
                            onChange={(e) => updateEvent(ev.id, { description: e.target.value })}
                            className="min-h-[90px] resize-y rounded-xl border-2 border-black p-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                            placeholder="Optional"
                          />
                        </label>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => removeEvent(ev.id)}
                          className="rounded-xl border-2 border-black bg-red-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-red-100"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black">Family Photos</h2>
                  <button
                    onClick={addFamilyPhoto}
                    className="rounded-xl border-2 border-black bg-blue-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-blue-100"
                    type="button"
                  >
                    + Add Photo
                  </button>
                </div>

                <p className="mt-3 text-lg font-semibold text-black/70">
                  Photos should live in <code className="font-black">public/photos/</code>. Use a path like{" "}
                  <code className="font-black">/photos/my-photo.jpg</code>.
                </p>

                <div className="mt-5 space-y-4">
                  {(draft.today.familyPhotos ?? draft.today.photos ?? []).map((ph) => (
                    <div key={ph.src} className="rounded-2xl border-2 border-black bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold">Image src</span>
                          <input
                            value={ph.src}
                            onChange={(e) => updateFamilyPhoto(ph.src, { src: e.target.value })}
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-lg font-bold">Alt text</span>
                          <input
                            value={ph.alt}
                            onChange={(e) => updateFamilyPhoto(ph.src, { alt: e.target.value })}
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="h-20 w-56 overflow-hidden rounded-xl border-2 border-black bg-white">
                          <img src={ph.src} alt={ph.alt} className="h-full w-full object-cover" />
                        </div>
                        <button
                          onClick={() => removeFamilyPhoto(ph.src)}
                          className="rounded-xl border-2 border-black bg-red-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-red-100"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black">Announcements</h2>
                  <button
                    onClick={addAnnouncement}
                    className="rounded-xl border-2 border-black bg-purple-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-purple-100"
                    type="button"
                  >
                    + Add Announcement
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {(draft.today.announcements ?? []).length === 0 ? (
                    <div className="rounded-xl border-2 border-black bg-slate-50 p-4 text-lg font-bold text-black/70">
                      No announcements yet.
                    </div>
                  ) : null}

                  {(draft.today.announcements ?? []).map((a) => (
                    <div key={a.id} className="rounded-2xl border-2 border-black bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-2 md:col-span-1">
                          <span className="text-lg font-bold">Title</span>
                          <input
                            value={a.title}
                            onChange={(e) =>
                              updateAnnouncement(a.id, { title: e.target.value })
                            }
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-lg font-bold">Message</span>
                          <input
                            value={a.message}
                            onChange={(e) =>
                              updateAnnouncement(a.id, { message: e.target.value })
                            }
                            className="h-12 rounded-xl border-2 border-black px-3 text-lg font-semibold outline-none focus:ring-4 focus:ring-yellow-300"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => removeAnnouncement(a.id)}
                          className="rounded-xl border-2 border-black bg-red-200 px-5 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-red-100"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-3xl font-black">Save / Reset</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={resetToBase}
                      className="rounded-xl border-2 border-black bg-white px-5 py-3 text-lg font-black hover:bg-slate-50"
                      type="button"
                    >
                      Reset to Base
                    </button>
                    <button
                      onClick={save}
                      className="rounded-xl border-2 border-black bg-yellow-300 px-6 py-3 text-lg font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-yellow-200"
                      type="button"
                    >
                      Save to localStorage
                    </button>
                  </div>
                </div>
                {error ? (
                  <div className="mt-4 rounded-xl border-2 border-red-600 bg-red-50 p-4 text-lg font-bold text-red-700">
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


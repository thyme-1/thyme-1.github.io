export type DashboardSchemaVersion = 1;

export type MealPlan = {
  breakfast: string;
  lunch: string;
  dinner: string;
};

export type DashboardEvent = {
  id: string;
  time: string;
  title: string;
  location?: string;
  description?: string;
};

export type DashboardPhoto = {
  src: string;
  alt: string;
};

export type DashboardAnnouncement = {
  id: string;
  title: string;
  message: string;
};

export type DashboardToday = {
  meals: MealPlan;
  events: DashboardEvent[];
  /**
   * Family-facing photos for residents (slideshow/grid).
   * For backwards compatibility, older data may still use `photos`.
   */
  familyPhotos?: DashboardPhoto[];
  /**
   * Legacy field (kept for existing saved localStorage data).
   * Prefer `familyPhotos` going forward.
   */
  photos?: DashboardPhoto[];
  announcements?: DashboardAnnouncement[];
};

export type DashboardData = {
  schemaVersion: DashboardSchemaVersion;
  home: {
    name: string;
    timezone: string;
  };
  today: DashboardToday;
};

export function isDashboardData(value: unknown): value is DashboardData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== 1) return false;
  if (!v.home || typeof v.home !== "object") return false;
  if (!v.today || typeof v.today !== "object") return false;

  const home = v.home as Record<string, unknown>;
  const today = v.today as Record<string, unknown>;
  const meals = today.meals as Record<string, unknown> | undefined;
  const events = today.events as unknown;
  const familyPhotos = today.familyPhotos as unknown;
  const photos = today.photos as unknown;
  const announcements = today.announcements as unknown;

  const hasMeals =
    !!meals &&
    typeof meals.breakfast === "string" &&
    typeof meals.lunch === "string" &&
    typeof meals.dinner === "string";

  const hasEvents =
    Array.isArray(events) &&
    events.every((e) => {
      if (!e || typeof e !== "object") return false;
      const ev = e as Record<string, unknown>;
      return (
        typeof ev.id === "string" &&
        typeof ev.time === "string" &&
        typeof ev.title === "string" &&
        (ev.location === undefined || typeof ev.location === "string") &&
        (ev.description === undefined || typeof ev.description === "string")
      );
    });

  const isPhotoArray = (arr: unknown) =>
    Array.isArray(arr) &&
    arr.every((p) => {
      if (!p || typeof p !== "object") return false;
      const ph = p as Record<string, unknown>;
      return typeof ph.src === "string" && typeof ph.alt === "string";
    });

  const hasSomePhotos = isPhotoArray(familyPhotos) || isPhotoArray(photos);

  const hasAnnouncements =
    announcements === undefined ||
    (Array.isArray(announcements) &&
      announcements.every((a) => {
        if (!a || typeof a !== "object") return false;
        const an = a as Record<string, unknown>;
        return (
          typeof an.id === "string" &&
          typeof an.title === "string" &&
          typeof an.message === "string"
        );
      }));

  return (
    typeof home.name === "string" &&
    typeof home.timezone === "string" &&
    hasMeals &&
    hasEvents &&
    hasSomePhotos &&
    hasAnnouncements
  );
}


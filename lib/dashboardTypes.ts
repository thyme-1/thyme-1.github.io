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

export type DashboardToday = {
  meals: MealPlan;
  events: DashboardEvent[];
  photos: DashboardPhoto[];
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
  const photos = today.photos as unknown;

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

  const hasPhotos =
    Array.isArray(photos) &&
    photos.every((p) => {
      if (!p || typeof p !== "object") return false;
      const ph = p as Record<string, unknown>;
      return typeof ph.src === "string" && typeof ph.alt === "string";
    });

  return (
    typeof home.name === "string" &&
    typeof home.timezone === "string" &&
    hasMeals &&
    hasEvents &&
    hasPhotos
  );
}


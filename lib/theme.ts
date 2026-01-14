export type ThemeMode = "auto" | "light" | "dark";
export type TimeOfDay = "morning" | "day" | "evening" | "night";

export const THEME_MODE_STORAGE_KEY = "resident-dashboard:themeMode";

export function getTimeOfDay(date: Date): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 16) return "day";
  if (h >= 16 && h < 20) return "evening";
  return "night";
}

export function resolveThemeMode(mode: ThemeMode, date: Date): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  const tod = getTimeOfDay(date);
  // Auto mode: nights are dark; everything else is light.
  return tod === "night" ? "dark" : "light";
}

export function timeOfDayGradientClasses(tod: TimeOfDay, theme: "light" | "dark") {
  // Keep gradients subtle + readable; cards handle contrast.
  if (theme === "dark") {
    switch (tod) {
      case "morning":
        return "bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950";
      case "day":
        return "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950";
      case "evening":
        return "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900";
      case "night":
      default:
        return "bg-gradient-to-br from-black via-slate-950 to-slate-900";
    }
  }

  switch (tod) {
    case "morning":
      return "bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50";
    case "day":
      return "bg-gradient-to-br from-sky-50 via-white to-emerald-50";
    case "evening":
      return "bg-gradient-to-br from-rose-50 via-amber-50 to-indigo-50";
    case "night":
    default:
      return "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100";
  }
}


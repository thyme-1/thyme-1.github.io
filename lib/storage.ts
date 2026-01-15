import { type DashboardData, isDashboardData } from "@/lib/dashboardTypes";

export const DASHBOARD_STORAGE_KEY = "resident-dashboard:data:v1";
export const ADMIN_SESSION_KEY = "resident-dashboard:adminSessionUntil";
export const STORAGE_EVENT_NAME = "resident-dashboard:storage";

function notifyStorageChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
}

export function loadDashboardOverrides(): DashboardData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isDashboardData(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDashboardOverrides(data: DashboardData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
  notifyStorageChanged();
}

export function clearDashboardOverrides() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  notifyStorageChanged();
}

export function isAdminSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return false;
  const until = Number(raw);
  return Number.isFinite(until) && until > Date.now();
}

export function startAdminSession(hours = 8) {
  if (typeof window === "undefined") return;
  const until = Date.now() + hours * 60 * 60 * 1000;
  window.localStorage.setItem(ADMIN_SESSION_KEY, String(until));
  notifyStorageChanged();
}

export function endAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  notifyStorageChanged();
}


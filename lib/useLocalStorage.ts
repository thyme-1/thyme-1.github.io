import { useSyncExternalStore } from "react";
import { type DashboardData, isDashboardData } from "@/lib/dashboardTypes";
import { DASHBOARD_STORAGE_KEY, STORAGE_EVENT_NAME } from "@/lib/storage";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    callback();
  };
  const onCustom = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT_NAME, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT_NAME, onCustom);
  };
}

export function useLocalStorageString(key: string): string | null {
  const getSnapshot = () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  };
  const getServerSnapshot = () => null;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useDashboardOverrides(): DashboardData | null {
  const raw = useLocalStorageString(DASHBOARD_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isDashboardData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}


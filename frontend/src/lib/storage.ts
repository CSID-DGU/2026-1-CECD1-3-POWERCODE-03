import type { ModelType } from "../types/domain";
import type { UserRole, ViewId } from "../types/app";

export const storageKeys = {
  widgetLayout: (role: UserRole) => `esb_widget_layout_${role}`,
  systemConfig: "esb_system_config",
  activeModel: "esb_tuning_active_model",
  runningEngine: "esb_running_engine_model",
  lastValidatedTime: "esb_last_validated_time",
  modelConfig: (type: ModelType) => `esb_model_config_${type}`,
  layoutWide: (view: ViewId | "settings" | "admin_system" | "admin_model") =>
    `esb_layout_wide_${view}`,
} as const;

export function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredText(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

export function setStoredText(key: string, value: string): void {
  localStorage.setItem(key, value);
}

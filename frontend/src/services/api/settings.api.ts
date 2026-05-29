import type { UserSettings } from "../mock/settings.mock";
import { httpClient } from "./client";

export function fetchUserSettings(): Promise<UserSettings> {
  return httpClient.get("/api/settings");
}

export function saveUserSettings(settings: UserSettings): Promise<UserSettings> {
  return httpClient.patch("/api/settings", settings);
}

import { getStored, setStored } from "../../lib/storage";
import type { UserSettings } from "../../types/domain";

const settingsKey = "esb_user_settings";

const defaultUserSettings: UserSettings = {
  dashboardNotification: true,
  emailNotification: false,
  slackNotification: true,
  compactMode: false,
  focusMode: false,
};

export async function fetchUserSettings(): Promise<UserSettings> {
  return getStored(settingsKey, defaultUserSettings);
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  setStored(settingsKey, settings);
}

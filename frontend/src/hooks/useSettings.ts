import { useEffect, useState } from "react";
import {
  fetchUserSettings,
  saveUserSettings,
  type UserSettings,
} from "../services/mock/settings.mock";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    fetchUserSettings().then(setSettings);
  }, []);

  const saveSettings = async (nextSettings: UserSettings) => {
    setSettings(nextSettings);
    await saveUserSettings(nextSettings);
  };

  return { settings, setSettings, saveSettings };
}

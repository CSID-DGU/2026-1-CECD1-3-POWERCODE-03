import type { ReactNode } from "react";

export type SettingsSectionId =
  | "notifications"
  | "integrations"
  | "display"
  | "profile";

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: ReactNode;
  className: string;
};

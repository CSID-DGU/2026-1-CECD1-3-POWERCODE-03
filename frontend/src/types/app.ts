import type { Icon } from "@tabler/icons-react";

export type UserRole = "user" | "admin";
export type ViewId = "home" | "analysis" | "settings" | "system" | "model";

export type NavItem = {
  id: ViewId;
  label: string;
  description: string;
  adminOnly?: boolean;
  Icon: Icon;
};

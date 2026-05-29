import type { UserRole, ViewId } from "../types/app";

type AppState = {
  selectedRole: UserRole | null;
  activeView: ViewId;
};

export const createInitialAppState = (): AppState => ({
  selectedRole: null,
  activeView: "home",
});

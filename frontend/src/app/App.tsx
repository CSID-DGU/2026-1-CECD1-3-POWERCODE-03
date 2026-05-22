import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { AnalysisMock } from "../features/analysis/AnalysisMock";
import { AdminModelPlaceholder } from "../features/admin_model/AdminModelPlaceholder";
import { AdminSystemPlaceholder } from "../features/admin_system/AdminSystemPlaceholder";
import { HomeMock } from "../features/home/HomeMock";
import { TopNav } from "../features/navigation/TopNav";
import { RoleSelector } from "../features/role_select/RoleSelector";
import { SettingsPlaceholder } from "../features/settings/SettingsPlaceholder";
import { createInitialAppState } from "../stores/appStore";
import type { UserRole, ViewId } from "../types/app";
import { getVisibleNavItems } from "./router";

export const App = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(createInitialAppState().selectedRole);
  const [activeView, setActiveView] = useState<ViewId>(createInitialAppState().activeView);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setActiveView("home");
  };

  if (!selectedRole) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  const visibleNavItems = getVisibleNavItems(selectedRole);

  return (
    <AppShell
      topNav={
        <TopNav
          activeView={activeView}
          navItems={visibleNavItems}
          role={selectedRole}
          onChangeRole={() => setSelectedRole(null)}
          onSelectView={setActiveView}
        />
      }
    >
      <ViewPanel activeView={activeView} role={selectedRole} onSelectView={setActiveView} />
    </AppShell>
  );
};

type ViewPanelProps = {
  activeView: ViewId;
  role: UserRole;
  onSelectView: (view: ViewId) => void;
};

const ViewPanel = ({ activeView, role, onSelectView }: ViewPanelProps) => {
  if (activeView === "home") {
    return <HomeMock role={role} onSelectView={onSelectView} />;
  }

  if (activeView === "analysis") {
    return <AnalysisMock />;
  }

  if (activeView === "settings") {
    return <SettingsPlaceholder />;
  }

  if (activeView === "system") {
    return <AdminSystemPlaceholder />;
  }

  if (activeView === "model") {
    return <AdminModelPlaceholder />;
  }

  return <AnalysisMock />;
};

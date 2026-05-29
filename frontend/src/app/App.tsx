import { useState, useEffect } from "react";
import { AppShell } from "../components/layout/AppShell";
import { AnalysisMock } from "../features/analysis/AnalysisMock";
import { AdminModelPlaceholder } from "../features/admin_model/AdminModelPlaceholder";
import { AdminSystemPlaceholder } from "../features/admin_system/AdminSystemPlaceholder";
import { HomeMock } from "../features/home/HomeMock";
import { TopNav } from "../features/navigation/TopNav";
import { AuthPage } from "../features/auth/AuthPage";
import { SettingsPlaceholder } from "../features/settings/SettingsPlaceholder";
import { createInitialAppState } from "../stores/appStore";
import type { UserRole, ViewId } from "../types/app";
import { getVisibleNavItems } from "./router";
import { httpClient } from "../services/api/client";

export const App = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [isVerifying, setIsVerifying] = useState(true);

  // Check login state on startup
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        const response = await httpClient.get<{ user: { userType: UserRole } }>("/api/auth/me");
        setSelectedRole(response.user.userType);
        setActiveView("home");
      } catch (error) {
        console.error("Token verification failed, clearing auth:", error);
        localStorage.removeItem("token");
      } finally {
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, []);

  const handleLoginSuccess = (token: string, role: UserRole) => {
    localStorage.setItem("token", token);
    setSelectedRole(role);
    setActiveView("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSelectedRole(null);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090b11] text-slate-100">
        <span className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">연결 보안 검증 중...</p>
      </div>
    );
  }

  if (!selectedRole) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const visibleNavItems = getVisibleNavItems(selectedRole);

  return (
    <AppShell
      topNav = {
        <TopNav
          activeView={activeView}
          navItems={visibleNavItems}
          role={selectedRole}
          onChangeRole={handleLogout} // Role switch now acts as Log Out
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

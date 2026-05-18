import { navItems } from "../../app/router";
import type { UserRole, ViewId } from "../../types/app";

type WorkspaceHeaderProps = {
  activeView: ViewId;
  role: UserRole;
};

export const WorkspaceHeader = ({ activeView, role }: WorkspaceHeaderProps) => {
  const currentView = navItems.find((item) => item.id === activeView) ?? navItems[0];

  return (
    <header className="workspace-header">
      <div>
        <p className="eyebrow">{role === "admin" ? "Admin workspace" : "User workspace"}</p>
        <h1>{currentView.label}</h1>
      </div>
      <p>{currentView.description}</p>
    </header>
  );
};

import { motion } from "motion/react";
import { IconSun, IconBell } from "@tabler/icons-react";
import { Button } from "../../components/ui/button";
import type { NavItem, UserRole, ViewId } from "../../types/app";
import inzentLogo from "./inzent_logo.svg";

type TopNavProps = {
  activeView: ViewId;
  navItems: NavItem[];
  role: UserRole;
  onChangeRole: () => void;
  onSelectView: (viewId: ViewId) => void;
};

export const TopNav = ({
  activeView,
  navItems,
  role,
  onChangeRole,
  onSelectView,
}: TopNavProps) => (
  <header className="top-nav">
    <div className="brand">
      <img src={inzentLogo} alt="INZENT" className="brand-logo" />
      <div>
        <strong>ESB 이상 징후 탐지 대시보드</strong>
        <span>{role === "admin" ? "관리자" : "일반 사용자"} 모드</span>
      </div>
    </div>
    <nav className="tab-list" aria-label="주요 화면">
      {navItems.map(({ id, label, Icon }) => {
        const isActive = activeView === id;
        return (
          <motion.button
            key={id}
            type="button"
            className={isActive ? "tab-item tab-item--active" : "tab-item"}
            onClick={() => onSelectView(id)}
            initial={false}
            animate={{ opacity: isActive ? 1 : 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </motion.button>
        );
      })}
    </nav>
    <div className="top-nav-actions">
      <button type="button" className="ghost-button" onClick={onChangeRole}>
        역할 변경
      </button>
      <Button variant="ghost" size="icon" className="top-nav-icon-btn">
        <IconSun size={20} aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" className="top-nav-icon-btn">
        <IconBell size={20} aria-hidden="true" />
      </Button>
      <button type="button" className="top-nav-profile-btn">
        AD
      </button>
    </div>
  </header>
);

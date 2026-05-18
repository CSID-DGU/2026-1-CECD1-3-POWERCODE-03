import type { NavItem, UserRole, ViewId } from "../../types/app";

type TopNavProps = {
  activeView: ViewId;
  navItems: NavItem[];
  role: UserRole;
  onChangeRole: () => void;
  onSelectView: (viewId: ViewId) => void;
};

export const TopNav = ({ activeView, navItems, role, onChangeRole, onSelectView }: TopNavProps) => (
  <header className="top-nav">
    <div className="brand">
      <span className="brand-mark">ESB</span>
      <div>
        <strong>이상 징후 탐지</strong>
        <span>{role === "admin" ? "관리자" : "일반 사용자"} 모드</span>
      </div>
    </div>
    <nav className="tab-list" aria-label="주요 화면">
      {navItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={activeView === id ? "tab-item tab-item--active" : "tab-item"}
          onClick={() => onSelectView(id)}
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
    <button type="button" className="ghost-button" onClick={onChangeRole}>
      역할 변경
    </button>
  </header>
);

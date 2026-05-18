import { StrictMode } from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Bell, BrainCircuit, Home, ServerCog, Settings } from "lucide-react";
import "./styles.css";

type UserRole = "user" | "admin";
type ViewId = "home" | "analysis" | "settings" | "system" | "model";

type NavItem = {
  id: ViewId;
  label: string;
  description: string;
  adminOnly?: boolean;
  Icon: typeof Home;
};

const navItems: NavItem[] = [
  { id: "home", label: "홈", description: "관제 요약 및 위젯", Icon: Home },
  { id: "analysis", label: "상세 분석", description: "의심 로그 분석", Icon: Activity },
  { id: "settings", label: "설정", description: "알림 및 화면 설정", Icon: Settings },
  { id: "system", label: "시스템 설정", description: "데이터 수집 및 서버 상태", adminOnly: true, Icon: ServerCog },
  { id: "model", label: "모델 관리", description: "모델 상태 및 threshold", adminOnly: true, Icon: BrainCircuit },
];

const roleSummary: Record<UserRole, string> = {
  user: "이상 로그 확인, 상세 분석, 알림 설정을 수행하는 일반 사용자 화면입니다.",
  admin: "일반 사용자 기능에 시스템 설정과 모델 관리 목업이 추가된 관리자 화면입니다.",
};

const App = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("home");

  const visibleNavItems = navItems.filter((item) => selectedRole === "admin" || !item.adminOnly);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setActiveView("home");
  };

  if (!selectedRole) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  return (
    <main className="app-shell">
      <TopNav
        activeView={activeView}
        navItems={visibleNavItems}
        role={selectedRole}
        onChangeRole={() => setSelectedRole(null)}
        onSelectView={setActiveView}
      />
      <section className="workspace">
        <HeaderPanel activeView={activeView} role={selectedRole} />
        <ViewPanel activeView={activeView} role={selectedRole} />
      </section>
    </main>
  );
};

type RoleSelectorProps = {
  onSelectRole: (role: UserRole) => void;
};

const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => (
  <main className="role-page">
    <section className="role-hero">
      <p className="eyebrow">ESB Anomaly Detection</p>
      <h1>이상 징후 탐지 대시보드 목업</h1>
      <p className="hero-copy">
        API 연동 전 화면 구조, 역할별 접근, 주요 상태 표현을 검증하기 위한 React 기반 프론트엔드 목업입니다.
      </p>
      <div className="role-grid">
        <RoleCard
          role="user"
          title="일반 사용자"
          description={roleSummary.user}
          items={["홈 위젯 관제", "상세 분석", "알림 및 화면 설정"]}
          onSelectRole={onSelectRole}
        />
        <RoleCard
          role="admin"
          title="관리자"
          description={roleSummary.admin}
          items={["일반 사용자 기능", "시스템 설정", "모델 관리"]}
          onSelectRole={onSelectRole}
        />
      </div>
    </section>
  </main>
);

type RoleCardProps = {
  role: UserRole;
  title: string;
  description: string;
  items: string[];
  onSelectRole: (role: UserRole) => void;
};

const RoleCard = ({ role, title, description, items, onSelectRole }: RoleCardProps) => (
  <article className="role-card">
    <div className="role-card__header">
      <span className="role-badge">{role === "admin" ? "Admin" : "User"}</span>
      <Bell size={18} aria-hidden="true" />
    </div>
    <h2>{title}</h2>
    <p>{description}</p>
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
    <button type="button" onClick={() => onSelectRole(role)}>
      {title}로 시작
    </button>
  </article>
);

type TopNavProps = {
  activeView: ViewId;
  navItems: NavItem[];
  role: UserRole;
  onChangeRole: () => void;
  onSelectView: (viewId: ViewId) => void;
};

const TopNav = ({ activeView, navItems, role, onChangeRole, onSelectView }: TopNavProps) => (
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

type HeaderPanelProps = {
  activeView: ViewId;
  role: UserRole;
};

const HeaderPanel = ({ activeView, role }: HeaderPanelProps) => {
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

type ViewPanelProps = {
  activeView: ViewId;
  role: UserRole;
};

const ViewPanel = ({ activeView, role }: ViewPanelProps) => {
  if (activeView === "home") {
    return <HomeMock role={role} />;
  }

  const titleMap: Record<Exclude<ViewId, "home">, string> = {
    analysis: "상세 분석 목업 영역",
    settings: "설정 목업 영역",
    system: "관리자 시스템 설정 목업 영역",
    model: "관리자 모델 관리 목업 영역",
  };

  return (
    <section className="placeholder-panel">
      <span className="status-pill status-pill--info">Mock</span>
      <h2>{titleMap[activeView]}</h2>
      <p>다음 기능 단위에서 문서 기준에 맞춰 상세 화면과 상태 흐름을 채웁니다.</p>
    </section>
  );
};

type HomeMockProps = {
  role: UserRole;
};

const HomeMock = ({ role }: HomeMockProps) => {
  const widgets = [
    { title: "현재 시스템 상태", value: "주의", meta: "최근 5분 Critical 2건", status: "warning" },
    { title: "주요 위험 이벤트", value: "7건", meta: "Critical 2 / Warning 5", status: "critical" },
    { title: "최근 알림", value: "12건", meta: "메일 발송 실패 1건", status: "warning" },
    { title: "최근 이상 로그", value: "38건", meta: "최근 1시간 기준", status: "normal" },
    { title: "처리시간 변화", value: "+18%", meta: "평균 420ms", status: "warning" },
    { title: "실패율 변화", value: "1.8%", meta: "이전 window 대비 +0.4%", status: "normal" },
  ];

  const adminWidgets = [
    { title: "데이터 수집 상태", value: "지연", meta: "최근 수집 3분 전", status: "warning" },
    { title: "모델 상태", value: "v0.3.1", meta: "최근 추론 42초 전", status: "normal" },
  ];

  const visibleWidgets = role === "admin" ? [...widgets, ...adminWidgets] : widgets;

  return (
    <section className="widget-grid">
      {visibleWidgets.map((widget) => (
        <article key={widget.title} className="widget-card">
          <div className="widget-card__header">
            <h2>{widget.title}</h2>
            <span className={`status-dot status-dot--${widget.status}`} />
          </div>
          <strong>{widget.value}</strong>
          <p>{widget.meta}</p>
        </article>
      ))}
    </section>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

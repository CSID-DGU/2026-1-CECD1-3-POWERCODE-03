import type { UserRole } from "../../types/app";

const roleSummary: Record<UserRole, string> = {
  user: "이상 로그 확인, 상세 분석, 알림 설정을 수행하는 일반 사용자 화면입니다.",
  admin: "일반 사용자 기능에 시스템 설정과 모델 관리 목업이 추가된 관리자 화면입니다.",
};

type RoleSelectorProps = {
  onSelectRole: (role: UserRole) => void;
};

export const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => (
  <main className="role-page">
    <section className="role-hero">
      <p className="eyebrow">ESB Anomaly Detection</p>
      <h1>이상 징후 탐지 대시보드 목업</h1>
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

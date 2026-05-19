import {
  IconBell,
  IconClock,
  IconDeviceDesktop,
  IconLayoutDashboard,
  IconMail,
  IconPalette,
  IconShieldCheck,
  IconUserCog,
  IconVolume,
} from "@tabler/icons-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import { SidebarNav, type SidebarNavGroup } from "../../components/layout/SidebarNav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

type SettingsSectionId = "notifications" | "display" | "profile";

type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: ReactNode;
  className: string;
};

const settingsSections: SettingsSection[] = [
  {
    id: "notifications",
    label: "알림",
    description: "이상 징후 감지와 처리 상태 알림",
    icon: <IconBell size={17} aria-hidden="true" />,
    className: "settings-theme--notifications",
  },
  {
    id: "display",
    label: "화면/위젯",
    description: "홈 위젯과 대시보드 표시 방식",
    icon: <IconLayoutDashboard size={17} aria-hidden="true" />,
    className: "settings-theme--display",
  },
  {
    id: "profile",
    label: "사용자 환경",
    description: "계정, 권한, 기본 작업 환경",
    icon: <IconUserCog size={17} aria-hidden="true" />,
    className: "settings-theme--profile",
  },
];

export const SettingsPlaceholder = () => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("notifications");
  const activeConfig = settingsSections.find((section) => section.id === activeSection) ?? settingsSections[0];

  const sidebarGroups = useMemo<SidebarNavGroup<SettingsSectionId>[]>(
    () => [
      {
        title: "설정",
        items: settingsSections.map((section) => ({
          id: section.id,
          label: section.label,
          icon: section.icon,
          className: section.className,
        })),
      },
    ],
    [],
  );

  return (
    <section className="settings-workspace">
      <SidebarNav activeId={activeSection} groups={sidebarGroups} onSelect={setActiveSection} />
      <main className="settings-main">
        <AnimatePresence mode="wait">
          <AnimatedPanel key={activeSection} className="settings-panel">
            <SettingsHeader config={activeConfig} />
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "display" && <DisplaySettings />}
            {activeSection === "profile" && <ProfileSettings />}
          </AnimatedPanel>
        </AnimatePresence>
      </main>
    </section>
  );
};

const SettingsHeader = ({ config }: { config: SettingsSection }) => (
  <header className="settings-header">
    <div>
      <p className="eyebrow">Settings</p>
      <h2>
        <span className={`settings-heading-icon ${config.className}`}>{config.icon}</span>
        {config.label}
      </h2>
      <p>{config.description}</p>
    </div>
    <Button variant="outline" onClick={() => toast.success("설정 변경사항을 저장했습니다.")}>
      변경사항 저장
    </Button>
  </header>
);

const NotificationSettings = () => (
  <div className="settings-grid">
    <SettingsCard icon={<IconBell size={18} aria-hidden="true" />} title="이상 징후 알림">
      <SettingRow label="Critical 즉시 알림" description="치명적 이상 징후 감지 시 상단 알림과 toast를 표시합니다." enabled />
      <SettingRow label="Warning 묶음 알림" description="주의 단계 이벤트는 10분 단위로 묶어서 표시합니다." enabled />
      <SettingRow label="Info 알림" description="정보성 이벤트는 기본적으로 목록에만 표시합니다." />
    </SettingsCard>
    <SettingsCard icon={<IconMail size={18} aria-hidden="true" />} title="전송 채널">
      <ChannelRow label="대시보드 알림" status="사용 중" />
      <ChannelRow label="이메일" status="목업" />
      <ChannelRow label="Slack/Webhook" status="추후 연동" />
    </SettingsCard>
    <SettingsCard icon={<IconClock size={18} aria-hidden="true" />} title="알림 시간">
      <SettingRow label="운영 시간 우선" description="평일 09:00-18:00에는 모든 알림을 즉시 표시합니다." enabled />
      <SettingRow label="야간 알림 축소" description="야간에는 Critical과 Open 변경만 표시합니다." enabled />
    </SettingsCard>
  </div>
);

const DisplaySettings = () => (
  <div className="settings-grid">
    <SettingsCard icon={<IconDeviceDesktop size={18} aria-hidden="true" />} title="대시보드 표시">
      <SettingRow label="밀도 높은 레이아웃" description="운영 모니터링에 맞춰 카드 간격을 좁게 유지합니다." enabled />
      <SettingRow label="상단 헤더 축소" description="분석 화면에서 콘텐츠 영역을 더 크게 사용합니다." enabled />
      <SettingRow label="숫자 강조" description="위험도 점수와 처리시간 수치를 더 크게 표시합니다." />
    </SettingsCard>
    <SettingsCard icon={<IconPalette size={18} aria-hidden="true" />} title="테마">
      <ThemeSwatches />
    </SettingsCard>
    <SettingsCard icon={<IconLayoutDashboard size={18} aria-hidden="true" />} title="홈 위젯">
      <SettingRow label="위젯 편집 애니메이션" description="macOS 스타일 편집 흔들림과 drag 전환을 사용합니다." enabled />
      <SettingRow label="빈 위젯 catalog 표시" description="숨긴 위젯과 추가 가능한 위젯을 갤러리에서 관리합니다." enabled />
    </SettingsCard>
  </div>
);

const ProfileSettings = () => (
  <div className="settings-grid">
    <SettingsCard icon={<IconUserCog size={18} aria-hidden="true" />} title="사용자 기본값">
      <ProfileField label="기본 역할" value="일반 사용자" />
      <ProfileField label="기본 진입 화면" value="홈" />
      <ProfileField label="시간대" value="Asia/Seoul" />
    </SettingsCard>
    <SettingsCard icon={<IconShieldCheck size={18} aria-hidden="true" />} title="권한 표시">
      <SettingRow label="관리자 탭 숨김" description="일반 사용자 모드에서는 시스템 설정과 모델 관리를 숨깁니다." enabled />
      <SettingRow label="상태 변경 확인" description="Open/Resolved 전환 전 확인 절차를 둘 수 있습니다." />
    </SettingsCard>
    <SettingsCard icon={<IconVolume size={18} aria-hidden="true" />} title="피드백">
      <SettingRow label="Toast 알림" description="저장, 복사, 상태 변경 결과를 화면에 표시합니다." enabled />
      <SettingRow label="효과음" description="운영 대시보드에서는 기본 비활성화합니다." />
    </SettingsCard>
  </div>
);

const SettingsCard = ({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) => (
  <section className="settings-section">
    <div className="settings-section__title">
      {icon}
      <h3>{title}</h3>
    </div>
    <div className="settings-card">
      <div className="settings-card__body">{children}</div>
    </div>
  </section>
);

const SettingRow = ({ description, enabled = false, label }: { description: string; enabled?: boolean; label: string }) => {
  const [checked, setChecked] = useState(enabled);

  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={`${label} ${checked ? "켜짐" : "꺼짐"}`} />
    </div>
  );
};

const ChannelRow = ({ label, status }: { label: string; status: string }) => (
  <div className="settings-channel-row">
    <span>{label}</span>
    <Badge variant={status === "사용 중" ? "success" : "default"}>{status}</Badge>
  </div>
);

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="settings-profile-field">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const ThemeSwatches = () => (
  <div className="settings-swatches">
    <span style={{ background: "#171717" }} />
    <span style={{ background: "#e03131" }} />
    <span style={{ background: "#f08c00" }} />
    <span style={{ background: "#3b82f6" }} />
    <span style={{ background: "#2f9e44" }} />
  </div>
);

import {
  IconAlertTriangle,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBell,
  IconBrandSlack,
  IconFlame,
  IconInfoCircle,
  IconLayout,
  IconLayoutDashboard,
  IconMail,
  IconPlug,
  IconSettings,
  IconUserCog,
  IconWebhook,
} from "@tabler/icons-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { SettingsSection, SettingsSectionId } from "./types";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import { SidebarNav, type SidebarNavGroup } from "../../components/layout/SidebarNav";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Modal } from "../../components/ui/Modal";
import { getStored, setStored, storageKeys } from "../../lib/storage";

const settingsSections: SettingsSection[] = [
  {
    id: "notifications",
    label: "알림 설정",
    description: "위험도별 알림 및 푸시 설정",
    icon: <IconBell size={17} aria-hidden="true" />,
    className: "settings-theme--notifications",
  },
  {
    id: "integrations",
    label: "연동 관리",
    description: "Slack, 이메일, Webhook 등 외부 서비스 연결",
    icon: <IconPlug size={17} aria-hidden="true" />,
    className: "settings-theme--integrations",
  },
  {
    id: "display",
    label: "화면/위젯",
    description: "홈 위젯 구성 및 테마 설정",
    icon: <IconLayoutDashboard size={17} aria-hidden="true" />,
    className: "settings-theme--display",
  },
  {
    id: "profile",
    label: "사용자 환경",
    description: "계정 기본값 및 모니터링 세부 환경 설정",
    icon: <IconUserCog size={17} aria-hidden="true" />,
    className: "settings-theme--profile",
  },
];

export const SettingsPlaceholder = () => {
  const [isWide, setIsWide] = useState<boolean>(() => {
    return getStored(storageKeys.layoutWide("settings"), false);
  });

  const handleToggleWide = (val: boolean) => {
    setIsWide(val);
    setStored(storageKeys.layoutWide("settings"), val);
  };

  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("notifications");
  const activeConfig =
    settingsSections.find((section) => section.id === activeSection) ??
    settingsSections[0];

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
      <SidebarNav
        activeId={activeSection}
        groups={sidebarGroups}
        onSelect={setActiveSection}
      />
      <main className="settings-main">
        <AnimatePresence mode="wait">
          <AnimatedPanel key={activeSection} className={`settings-panel ${isWide ? "settings-panel--wide" : ""}`}>
            <SettingsHeader
              config={activeConfig}
              isWide={isWide}
              onToggleWide={handleToggleWide}
            />
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "integrations" && <IntegrationsSettings />}
            {activeSection === "display" && <DisplaySettings />}
            {activeSection === "profile" && <ProfileSettings />}
          </AnimatedPanel>
        </AnimatePresence>
      </main>
    </section>
  );
};

const SettingsHeader = ({
  config,
  isWide,
  onToggleWide,
}: {
  config: SettingsSection;
  isWide: boolean;
  onToggleWide: (val: boolean) => void;
}) => (
  <header className="settings-header">
    <div>
      <h2>
        <span className={`settings-heading-icon ${config.className}`}>
          {config.icon}
        </span>
        {config.label}
      </h2>
    </div>
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onToggleWide(!isWide)}
        aria-label={isWide ? "콤팩트 화면으로 보기" : "넓은 화면으로 보기"}
      >
        {isWide ? <IconArrowsMinimize size={15} /> : <IconArrowsMaximize size={15} />}
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("설정 변경사항을 저장했습니다.")}
      >
        변경사항 저장
      </Button>
    </div>
  </header>
);

const NotificationSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="위험도별 알림 채널 설정">
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <SeverityChannelRow
          severity="critical"
          label="위험"
          subLabel="Critical"
          description="가장 높은 위험도. 즉각적인 조치가 필요한 심각한 장애 상황"
          defaultDashboard={true}
          defaultEmail={true}
          defaultSlack={true}
        />
        <SeverityChannelRow
          severity="warning"
          label="주의"
          subLabel="Warning"
          description="중간 위험도. 단기 패턴 어긋남 또는 임계치 부근 감지"
          defaultDashboard={true}
          defaultEmail={false}
          defaultSlack={true}
        />
        <SeverityChannelRow
          severity="info"
          label="참고"
          subLabel="Info"
          description="가장 낮은 위험도. 단순 프로세스 단기 지연 또는 무해한 변동"
          defaultDashboard={false}
          defaultEmail={false}
          defaultSlack={false}
        />
      </div>
    </SettingsCard>

    <SettingsCard title="알림 시간">
      <SettingRow
        label="운영 시간 우선"
        description="평일 09:00-18:00에는 모든 알림을 즉시 표시합니다."
        enabled
      />
      <SettingRow
        label="야간 알림 축소"
        description="야간에는 위험 단계 알림만 스마트폰 슬랙으로 즉시 발송합니다."
        enabled
      />
    </SettingsCard>
  </div>
);

const SeverityChannelRow = ({
  severity,
  label,
  subLabel,
  description,
  defaultDashboard,
  defaultEmail,
  defaultSlack,
}: {
  severity: "critical" | "warning" | "info";
  label: string;
  subLabel: string;
  description: string;
  defaultDashboard: boolean;
  defaultEmail: boolean;
  defaultSlack: boolean;
}) => {
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [email, setEmail] = useState(defaultEmail);
  const [slack, setSlack] = useState(defaultSlack);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 임시 설정 상태 (다이얼로그에서 변경 전까지 상태 동결용)
  const [tempDashboard, setTempDashboard] = useState(defaultDashboard);
  const [tempEmail, setTempEmail] = useState(defaultEmail);
  const [tempSlack, setTempSlack] = useState(defaultSlack);

  // 모달 열고 닫을 때 현재 확정 상태 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDashboard(dashboard);
      setTempEmail(email);
      setTempSlack(slack);
    }
    setIsModalOpen(open);
  };

  const handleSave = () => {
    setDashboard(tempDashboard);
    setEmail(tempEmail);
    setSlack(tempSlack);
    setIsModalOpen(false);
    toast.success(`${label} 알림 채널 설정을 저장했습니다.`);
  };

  // 상세분석(Analysis) 탭 테마 컬러 & 아이콘과 일관성 유지
  const severityStyle = {
    critical: {
      color: "#e03131",
      bg: "#ffe3e3",
      border: "rgba(224, 49, 49, 0.2)",
      icon: <IconFlame size={18} style={{ color: "#e03131" }} />,
    },
    warning: {
      color: "#f08c00",
      bg: "#fff0d0",
      border: "rgba(240, 140, 0, 0.2)",
      icon: <IconAlertTriangle size={18} style={{ color: "#f08c00" }} />,
    },
    info: {
      color: "#3b82f6",
      bg: "#e7f0ff",
      border: "rgba(59, 130, 246, 0.2)",
      icon: <IconInfoCircle size={18} style={{ color: "#3b82f6" }} />,
    },
  }[severity];

  return (
    <div className="severity-channel-row" style={{ padding: "var(--space-md)", background: "var(--canvas)", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: severityStyle.bg,
            border: `1px solid ${severityStyle.border}`,
            color: severityStyle.color,
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {severityStyle.icon}
            <span>{label}</span>
          </div>
          <span style={{ color: "var(--mute)", fontSize: "11px", textTransform: "uppercase", fontWeight: 500 }}>{subLabel}</span>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* 활성화된 알림 채널 목록 뱃지 (시각적 일관성) */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {dashboard && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "var(--radius-sm)", background: "var(--canvas-soft-2)", fontSize: "11px", color: "var(--ink)", fontWeight: 500, border: "1px solid var(--hairline)" }}>
                <IconLayout size={12} />
                대시보드
              </span>
            )}
            {email && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "var(--radius-sm)", background: "var(--canvas-soft-2)", fontSize: "11px", color: "var(--ink)", fontWeight: 500, border: "1px solid var(--hairline)" }}>
                <IconMail size={12} />
                이메일
              </span>
            )}
            {slack && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "var(--radius-sm)", background: "var(--canvas-soft-2)", fontSize: "11px", color: "var(--ink)", fontWeight: 500, border: "1px solid var(--hairline)" }}>
                <IconBrandSlack size={12} />
                Slack
              </span>
            )}
            {!dashboard && !email && !slack && (
              <span style={{ fontSize: "11px", color: "var(--mute)", fontStyle: "italic" }}>활성화된 알림 채널 없음</span>
            )}
          </div>

          {/* 모달 설정을 트리거하는 예쁜 버튼 */}
          <Modal
            isOpen={isModalOpen}
            onOpenChange={handleOpenChange}
            size="md"
            trigger={
              <Button size="sm" variant="outline" style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "28px", padding: "0 10px", fontSize: "12px" }}>
                <IconSettings size={13} />
                설정
              </Button>
            }
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--ink)" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: severityStyle.bg,
                  border: `1px solid ${severityStyle.border}`,
                  color: severityStyle.color,
                  fontSize: "11px",
                  fontWeight: "bold"
                }}>
                  {severityStyle.icon}
                  <span>{label}</span>
                </span>
                알림 채널 설정
              </div>
            }
            description={`${label} (${subLabel}) 등급의 이상 징후 감지 시 경보를 전송할 채널을 개별 설정합니다.`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", marginBottom: "12px" }}>
              {/* 대시보드 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--hairline)", background: "var(--canvas-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <IconLayout size={18} style={{ color: "var(--ink)" }} />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ink)", display: "block" }}>웹 대시보드 실시간 알림</span>
                    <span style={{ fontSize: "11px", color: "var(--body)", display: "block", marginTop: "2px" }}>실시간 알림 인박스 및 대시보드 팝업 경보</span>
                  </div>
                </div>
                <Switch checked={tempDashboard} onCheckedChange={setTempDashboard} />
              </div>

              {/* 이메일 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--hairline)", background: "var(--canvas-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <IconMail size={18} style={{ color: "var(--ink)" }} />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ink)", display: "block" }}>SMTP 메일 발송</span>
                    <span style={{ fontSize: "11px", color: "var(--body)", display: "block", marginTop: "2px" }}>지정된 관리자 계정으로 메일 보고서 실시간 전송</span>
                  </div>
                </div>
                <Switch checked={tempEmail} onCheckedChange={setTempEmail} />
              </div>

              {/* Slack */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--hairline)", background: "var(--canvas-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <IconBrandSlack size={18} style={{ color: "var(--ink)" }} />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ink)", display: "block" }}>Slack Incoming Webhook</span>
                    <span style={{ fontSize: "11px", color: "var(--body)", display: "block", marginTop: "2px" }}>지정된 업무 슬랙 채널로 상세 분석 카드 푸시</span>
                  </div>
                </div>
                <Switch checked={tempSlack} onCheckedChange={setTempSlack} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px" }}>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>취소</Button>
              <Button size="sm" onClick={handleSave}>
                저장 적용
              </Button>
            </div>
          </Modal>
        </div>
      </div>
      <p style={{ margin: "0", color: "var(--body)", fontSize: "12px", paddingLeft: "2px", lineHeight: "1.4" }}>{description}</p>
    </div>
  );
};

const IntegrationsSettings = () => {
  const [slackUrl, setSlackUrl] = useState("https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX");
  const [emailSmtp, setEmailSmtp] = useState("smtp.company-esb.com");
  const [emailPort, setEmailPort] = useState("587");
  const [emailUser, setEmailUser] = useState("alert-system@company.com");
  const [webhookUrl, setWebhookUrl] = useState("https://api.company-esb.com/v1/webhook-receiver");
  
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);

  const handleTestSlack = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Slack 테스트 메시지 전송 중...",
        success: "Slack으로 테스트 알림이 성공적으로 발송되었습니다!",
        error: "전송 실패",
      }
    );
  };

  const handleTestEmail = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "SMTP 테스트 메일 전송 중...",
        success: "SMTP 서버 연결 성공! 테스트 메일이 발송되었습니다.",
        error: "연결 실패",
      }
    );
  };

  const handleTestWebhook = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1100)),
      {
        loading: "Webhook 테스트 호출 중...",
        success: "Webhook POST 호출 성공! (상태코드 200 OK)",
        error: "호출 실패",
      }
    );
  };

  return (
    <div className="settings-grid">
      <SettingsCard title="Slack 알림 연동">
        <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#f4ede4", alignItems: "center", justifyContent: "center" }}>
                <IconBrandSlack size={24} style={{ color: "#4A154B" }} />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>Slack Incoming Webhook</strong>
                <p style={{ margin: "2px 0 0", color: "var(--body)", fontSize: "12px" }}>지정한 슬랙 채널로 이상 징후 알림 카드를 실시간 전송합니다.</p>
              </div>
            </div>
            <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
          </div>
          
          {slackEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>WEBHOOK URL</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="password"
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--hairline)",
                    background: "var(--canvas-soft)",
                    color: "var(--ink)",
                    fontSize: "12px"
                  }}
                />
                <Button size="sm" variant="outline" onClick={handleTestSlack}>테스트 전송</Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="이메일 (SMTP) 연동">
        <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--theme-soft, #e8f0ff)", alignItems: "center", justifyContent: "center" }}>
                <IconMail size={24} style={{ color: "var(--theme-color, #2f6fed)" }} />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>SMTP 아웃바운드 서버</strong>
                <p style={{ margin: "2px 0 0", color: "var(--body)", fontSize: "12px" }}>사내 메일 서버를 통해 관리자들에게 이상 감지 경보 메일을 발송합니다.</p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          {emailEnabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginTop: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>SMTP 호스트</label>
                <input
                  type="text"
                  value={emailSmtp}
                  onChange={(e) => setEmailSmtp(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--hairline)",
                    background: "var(--canvas-soft)",
                    color: "var(--ink)",
                    fontSize: "12px"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>포트</label>
                <input
                  type="text"
                  value={emailPort}
                  onChange={(e) => setEmailPort(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--hairline)",
                    background: "var(--canvas-soft)",
                    color: "var(--ink)",
                    fontSize: "12px"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }}>
                <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>발신 계정</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={emailUser}
                    onChange={(e) => setEmailUser(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--hairline)",
                      background: "var(--canvas-soft)",
                      color: "var(--ink)",
                      fontSize: "12px"
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={handleTestEmail}>연동 테스트</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="커스텀 Webhook 연동">
        <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#eef2f6", alignItems: "center", justifyContent: "center" }}>
                <IconWebhook size={24} style={{ color: "#3b82f6" }} />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>Webhook (JSON POST)</strong>
                <p style={{ margin: "2px 0 0", color: "var(--body)", fontSize: "12px" }}>지정한 엔드포인트 URL로 실시간 이상 감지 페이로드를 POST 요청으로 전송합니다.</p>
              </div>
            </div>
            <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
          </div>

          {webhookEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>엔드포인트 URL</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--hairline)",
                    background: "var(--canvas-soft)",
                    color: "var(--ink)",
                    fontSize: "12px"
                  }}
                />
                <Button size="sm" variant="outline" onClick={handleTestWebhook}>테스트 호출</Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
};

const DisplaySettings = () => (
  <div className="settings-grid">
    <SettingsCard title="대시보드 표시">
      <SettingRow
        label="밀도 높은 레이아웃"
        description="운영 모니터링에 맞춰 카드 간격을 좁게 유지합니다."
        enabled
      />
      <SettingRow
        label="상단 헤더 축소"
        description="분석 화면에서 콘텐츠 영역을 더 크게 사용합니다."
        enabled
      />
      <SettingRow
        label="숫자 강조"
        description="위험도 점수와 처리시간 수치를 더 크게 표시합니다."
      />
    </SettingsCard>
    
    <SettingsCard title="테마 선택">
      <ThemeSettings />
    </SettingsCard>
    
    <SettingsCard title="홈 위젯">
      <SettingRow
        label="빈 위젯 catalog 표시"
        description="숨긴 위젯과 추가 가능한 위젯을 갤러리에서 관리합니다."
        enabled
      />
    </SettingsCard>
  </div>
);

const ThemeSettings = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "var(--space-md)" }}>
      <button
        onClick={() => {
          setTheme("light");
          toast.success("화이트 (라이트 테마)로 설정되었습니다.");
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          border: `2px solid ${theme === "light" ? "var(--theme-color, #7c3aed)" : "var(--hairline)"}`,
          background: "#ffffff",
          color: "#1a1a1a",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        className="theme-option"
      >
        <div style={{
          width: "100%",
          height: "48px",
          background: "#f8f9fa",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #dee2e6",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ width: "30%", height: "100%", background: "#ffffff", borderRight: "1px solid #dee2e6", position: "absolute", left: 0 }} />
          <div style={{ width: "50%", height: "8px", background: "#7c3aed", borderRadius: "4px", position: "absolute", top: "12px", left: "40%" }} />
          <div style={{ width: "40%", height: "6px", background: "#adb5bd", borderRadius: "3px", position: "absolute", top: "26px", left: "40%" }} />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>화이트 (라이트 테마)</span>
      </button>

      <button
        onClick={() => {
          setTheme("dark");
          toast.success("블랙 (다크 테마)로 설정되었습니다.");
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          border: `2px solid ${theme === "dark" ? "var(--theme-color, #7c3aed)" : "var(--hairline)"}`,
          background: "#121212",
          color: "#ffffff",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        className="theme-option"
      >
        <div style={{
          width: "100%",
          height: "48px",
          background: "#1e1e1e",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #2d2d2d",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ width: "30%", height: "100%", background: "#181818", borderRight: "1px solid #2d2d2d", position: "absolute", left: 0 }} />
          <div style={{ width: "50%", height: "8px", background: "#7c3aed", borderRadius: "4px", position: "absolute", top: "12px", left: "40%" }} />
          <div style={{ width: "40%", height: "6px", background: "#495057", borderRadius: "3px", position: "absolute", top: "26px", left: "40%" }} />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>블랙 (다크 테마)</span>
      </button>
    </div>
  );
};

const ProfileSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="사용자 기본값">
      <ProfileField label="기본 역할" value="일반 사용자" />
      <ProfileField label="기본 진입 화면" value="홈" />
      <ProfileField label="시간대" value="Asia/Seoul" />
    </SettingsCard>
    
    <SettingsCard title="권한 표시">
      <SettingRow
        label="관리자 탭 숨김"
        description="일반 사용자 모드에서는 시스템 설정과 모델 관리를 숨깁니다."
        enabled
      />
      <SettingRow
        label="상태 변경 확인"
        description="Open/Resolved 전환 전 확인 절차를 둘 수 있습니다."
      />
    </SettingsCard>
    
    <SettingsCard title="피드백">
      <SettingRow
        label="Toast 알림"
        description="저장, 복사, 상태 변경 결과를 화면에 표시합니다."
        enabled
      />
      <SettingRow
        label="효과음"
        description="운영 대시보드에서는 기본 비활성화합니다."
      />
    </SettingsCard>
  </div>
);

const SettingsCard = ({ children, title }: { children: ReactNode; title: string }) => (
  <section className="settings-section">
    <div className="settings-section__title">
      <h3>{title}</h3>
    </div>
    <div className="settings-card">
      <div className="settings-card__body">{children}</div>
    </div>
  </section>
);

const SettingRow = ({
  description,
  enabled = false,
  label,
}: {
  description: string;
  enabled?: boolean;
  label: string;
}) => {
  const [checked, setChecked] = useState(enabled);

  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        aria-label={`${label} ${checked ? "켜짐" : "꺼짐"}`}
      />
    </div>
  );
};

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="settings-profile-field">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

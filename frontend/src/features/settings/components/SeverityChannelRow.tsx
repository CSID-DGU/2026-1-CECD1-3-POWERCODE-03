import {
  IconAlertTriangle,
  IconBrandSlack,
  IconFlame,
  IconInfoCircle,
  IconLayout,
  IconMail,
  IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/Modal";
import { Switch } from "../../../components/ui/switch";

type SeverityChannelRowProps = {
  severity: "critical" | "warning" | "info";
  label: string;
  subLabel: string;
  description: string;
  defaultDashboard: boolean;
  defaultEmail: boolean;
  defaultSlack: boolean;
};

type ChannelBadgeProps = {
  channel: "dashboard" | "email" | "slack";
};

const severityTheme = {
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
};

const channelMeta = {
  dashboard: {
    label: "대시보드",
    icon: <IconLayout size={12} />,
  },
  email: {
    label: "이메일",
    icon: <IconMail size={12} />,
  },
  slack: {
    label: "Slack",
    icon: <IconBrandSlack size={12} />,
  },
};

const ChannelBadge = ({ channel }: ChannelBadgeProps) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "var(--radius-sm)", background: "var(--canvas-soft-2)", fontSize: "11px", color: "var(--ink)", fontWeight: 500, border: "1px solid var(--hairline)" }}>
    {channelMeta[channel].icon}
    {channelMeta[channel].label}
  </span>
);

const SeverityTag = ({
  label,
  severity,
  small = false,
}: {
  label: string;
  severity: SeverityChannelRowProps["severity"];
  small?: boolean;
}) => {
  const theme = severityTheme[severity];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: small ? "4px" : "6px",
        padding: small ? "2px 6px" : "4px 8px",
        borderRadius: "4px",
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        fontSize: small ? "11px" : "12px",
        fontWeight: "bold",
      }}
    >
      {theme.icon}
      <span>{label}</span>
    </span>
  );
};

export const SeverityChannelRow = ({
  severity,
  label,
  subLabel,
  description,
  defaultDashboard,
  defaultEmail,
  defaultSlack,
}: SeverityChannelRowProps) => {
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [email, setEmail] = useState(defaultEmail);
  const [slack, setSlack] = useState(defaultSlack);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempDashboard, setTempDashboard] = useState(defaultDashboard);
  const [tempEmail, setTempEmail] = useState(defaultEmail);
  const [tempSlack, setTempSlack] = useState(defaultSlack);

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

  return (
    <div className="severity-channel-row" style={{ padding: "var(--space-md)", background: "var(--canvas)", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SeverityTag severity={severity} label={label} />
          <span style={{ color: "var(--mute)", fontSize: "11px", textTransform: "uppercase", fontWeight: 500 }}>{subLabel}</span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {dashboard && <ChannelBadge channel="dashboard" />}
            {email && <ChannelBadge channel="email" />}
            {slack && <ChannelBadge channel="slack" />}
            {!dashboard && !email && !slack && (
              <span style={{ fontSize: "11px", color: "var(--mute)", fontStyle: "italic" }}>활성화된 알림 채널 없음</span>
            )}
          </div>

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
                <SeverityTag severity={severity} label={label} small />
                알림 채널 설정
              </div>
            }
            description={`${label} (${subLabel}) 등급의 이상 징후 감지 시 경보를 전송할 채널을 개별 설정합니다.`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", marginBottom: "12px" }}>
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
              <Button size="sm" onClick={handleSave}>저장</Button>
            </div>
          </Modal>
        </div>
      </div>
      <p style={{ margin: "0", color: "var(--body)", fontSize: "12px", paddingLeft: "2px", lineHeight: "1.4" }}>{description}</p>
    </div>
  );
};

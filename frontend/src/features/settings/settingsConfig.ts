import {
  IconBrandSlack,
  IconMail,
  IconWebhook,
  type Icon,
} from "@tabler/icons-react";

export type SettingsToggleConfig = {
  description: string;
  enabled?: boolean;
  label: string;
};

export type ProfileFieldConfig = {
  label: string;
  value: string;
};

export type SeverityChannelConfig = {
  defaultDashboard: boolean;
  defaultEmail: boolean;
  defaultSlack: boolean;
  description: string;
  label: string;
  severity: "critical" | "warning" | "info";
  subLabel: string;
};

export type IntegrationMetaConfig = {
  description: string;
  icon: Icon;
  iconBackground: string;
  iconColor: string;
  title: string;
  titleLabel: string;
};

export const severityChannelSettings: SeverityChannelConfig[] = [
  {
    severity: "critical",
    label: "위험",
    subLabel: "Critical",
    description: "가장 높은 위험도. 즉각적인 조치가 필요한 심각한 장애 상황",
    defaultDashboard: true,
    defaultEmail: true,
    defaultSlack: true,
  },
  {
    severity: "warning",
    label: "주의",
    subLabel: "Warning",
    description: "중간 위험도. 단기 패턴 어긋남 또는 임계치 부근 감지",
    defaultDashboard: true,
    defaultEmail: false,
    defaultSlack: true,
  },
  {
    severity: "info",
    label: "참고",
    subLabel: "Info",
    description: "가장 낮은 위험도. 단순 프로세스 단기 지연 또는 무해한 변동",
    defaultDashboard: false,
    defaultEmail: false,
    defaultSlack: false,
  },
];

export const notificationTimeSettings: SettingsToggleConfig[] = [
  {
    label: "운영 시간 우선",
    description: "평일 09:00-18:00에는 모든 알림을 즉시 표시합니다.",
    enabled: true,
  },
  {
    label: "야간 알림 축소",
    description: "야간에는 위험 단계 알림만 스마트폰 슬랙으로 즉시 발송합니다.",
    enabled: true,
  },
];

export const dashboardDisplaySettings: SettingsToggleConfig[] = [
  {
    label: "밀도 높은 레이아웃",
    description: "운영 모니터링에 맞춰 카드 간격을 좁게 유지합니다.",
    enabled: true,
  },
  {
    label: "상단 헤더 축소",
    description: "분석 화면에서 콘텐츠 영역을 더 크게 사용합니다.",
    enabled: true,
  },
  {
    label: "숫자 강조",
    description: "위험도 점수와 처리시간 수치를 더 크게 표시합니다.",
  },
];

export const homeWidgetSettings: SettingsToggleConfig[] = [
  {
    label: "빈 위젯 catalog 표시",
    description: "숨긴 위젯과 추가 가능한 위젯을 갤러리에서 관리합니다.",
    enabled: true,
  },
];

export const profileDefaults: ProfileFieldConfig[] = [
  { label: "기본 역할", value: "일반 사용자" },
  { label: "기본 진입 화면", value: "홈" },
  { label: "시간대", value: "Asia/Seoul" },
];

export const permissionSettings: SettingsToggleConfig[] = [
  {
    label: "관리자 탭 숨김",
    description: "일반 사용자 모드에서는 시스템 설정과 모델 관리를 숨깁니다.",
    enabled: true,
  },
  {
    label: "상태 변경 확인",
    description: "Open/Resolved 전환 전 확인 절차를 둘 수 있습니다.",
  },
];

export const feedbackSettings: SettingsToggleConfig[] = [
  {
    label: "Toast 알림",
    description: "저장, 복사, 상태 변경 결과를 화면에 표시합니다.",
    enabled: true,
  },
  {
    label: "효과음",
    description: "운영 대시보드에서는 기본 비활성화합니다.",
  },
];

export const integrationMeta = {
  slack: {
    title: "Slack 알림 연동",
    titleLabel: "Slack Incoming Webhook",
    description: "지정한 슬랙 채널로 이상 징후 알림 카드를 실시간 전송합니다.",
    icon: IconBrandSlack,
    iconBackground: "#f4ede4",
    iconColor: "#4A154B",
  },
  email: {
    title: "이메일 (SMTP) 연동",
    titleLabel: "SMTP 아웃바운드 서버",
    description: "사내 메일 서버를 통해 관리자들에게 이상 감지 경보 메일을 발송합니다.",
    icon: IconMail,
    iconBackground: "var(--theme-soft, #e8f0ff)",
    iconColor: "var(--theme-color, #2f6fed)",
  },
  webhook: {
    title: "커스텀 Webhook 연동",
    titleLabel: "Webhook (JSON POST)",
    description: "지정한 엔드포인트 URL로 실시간 이상 감지 페이로드를 POST 요청으로 전송합니다.",
    icon: IconWebhook,
    iconBackground: "#eef2f6",
    iconColor: "#3b82f6",
  },
} satisfies Record<string, IntegrationMetaConfig>;

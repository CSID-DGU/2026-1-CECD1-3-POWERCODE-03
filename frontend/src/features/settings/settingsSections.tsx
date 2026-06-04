import {
  IconBell,
  IconLayoutDashboard,
  IconPlug,
  IconUserCog,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { SettingsSection, SettingsSectionId } from "./types";
import { DisplaySettings } from "./sections/DisplaySettings";
import { IntegrationsSettings } from "./sections/IntegrationsSettings";
import { NotificationSettings } from "./sections/NotificationSettings";
import { ProfileSettings } from "./sections/ProfileSettings";

export const settingsSections: SettingsSection[] = [
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

export const settingsSectionComponentMap: Record<
  SettingsSectionId,
  ComponentType
> = {
  notifications: NotificationSettings,
  integrations: IntegrationsSettings,
  display: DisplaySettings,
  profile: ProfileSettings,
};

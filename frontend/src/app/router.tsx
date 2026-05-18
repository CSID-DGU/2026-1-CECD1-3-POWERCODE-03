import { IconActivity, IconBrain, IconHome, IconServerCog, IconSettings } from "@tabler/icons-react";
import type { NavItem, UserRole } from "../types/app";

export const navItems: NavItem[] = [
  { id: "home", label: "홈", description: "관제 요약 및 위젯", Icon: IconHome },
  { id: "analysis", label: "상세 분석", description: "의심 로그 분석", Icon: IconActivity },
  { id: "settings", label: "설정", description: "알림 및 화면 설정", Icon: IconSettings },
  { id: "system", label: "시스템 설정", description: "데이터 수집 및 서버 상태", adminOnly: true, Icon: IconServerCog },
  { id: "model", label: "모델 관리", description: "모델 상태 및 threshold", adminOnly: true, Icon: IconBrain },
];

export const getVisibleNavItems = (role: UserRole) => {
  return navItems.filter((item) => role === "admin" || !item.adminOnly);
};

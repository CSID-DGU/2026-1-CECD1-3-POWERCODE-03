import { Activity, BrainCircuit, Home, ServerCog, Settings } from "lucide-react";
import type { NavItem, UserRole } from "../types/app";

export const navItems: NavItem[] = [
  { id: "home", label: "홈", description: "관제 요약 및 위젯", Icon: Home },
  { id: "analysis", label: "상세 분석", description: "의심 로그 분석", Icon: Activity },
  { id: "settings", label: "설정", description: "알림 및 화면 설정", Icon: Settings },
  { id: "system", label: "시스템 설정", description: "데이터 수집 및 서버 상태", adminOnly: true, Icon: ServerCog },
  { id: "model", label: "모델 관리", description: "모델 상태 및 threshold", adminOnly: true, Icon: BrainCircuit },
];

export const getVisibleNavItems = (role: UserRole) => {
  return navItems.filter((item) => role === "admin" || !item.adminOnly);
};

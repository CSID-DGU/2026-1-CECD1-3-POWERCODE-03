import type { WidgetStatus } from "../types/mock";

export const widgetStatusLabel: Record<WidgetStatus, string> = {
  normal: "정상",
  warning: "주의",
  critical: "위험",
  empty: "데이터 없음",
};

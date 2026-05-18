import type { MockWidget } from "../../types/mock";

const userWidgets: MockWidget[] = [
  {
    widgetId: "system-status",
    title: "현재 시스템 상태",
    value: "주의",
    meta: "최근 5분 Critical 2건",
    size: "1x1",
    role: "all",
    status: "warning",
  },
  {
    widgetId: "major-risk-events",
    title: "주요 위험 이벤트",
    value: "7건",
    meta: "Critical 2 / Warning 5",
    size: "1x1",
    role: "all",
    status: "critical",
  },
  {
    widgetId: "recent-alerts",
    title: "최근 알림",
    value: "12건",
    meta: "메일 발송 실패 1건",
    size: "1x1",
    role: "all",
    status: "warning",
  },
  {
    widgetId: "recent-anomaly-logs",
    title: "최근 이상 로그",
    value: "38건",
    meta: "최근 1시간 기준",
    size: "1x1",
    role: "all",
    status: "normal",
  },
  {
    widgetId: "latency-change",
    title: "처리시간 변화",
    value: "+18%",
    meta: "평균 420ms",
    size: "1x1",
    role: "all",
    status: "warning",
  },
  {
    widgetId: "failure-rate-change",
    title: "실패율 변화",
    value: "1.8%",
    meta: "이전 window 대비 +0.4%",
    size: "1x1",
    role: "all",
    status: "normal",
  },
];

const adminWidgets: MockWidget[] = [
  {
    widgetId: "collector-status",
    title: "데이터 수집 상태",
    value: "지연",
    meta: "최근 수집 3분 전",
    size: "1x1",
    role: "admin",
    status: "warning",
  },
  {
    widgetId: "model-status",
    title: "모델 상태",
    value: "v0.3.1",
    meta: "최근 추론 42초 전",
    size: "1x1",
    role: "admin",
    status: "normal",
  },
];

export const allWidgets: MockWidget[] = [...userWidgets, ...adminWidgets];

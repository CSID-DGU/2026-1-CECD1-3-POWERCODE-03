export type WidgetStatus = "normal" | "warning" | "critical" | "empty";
export type WidgetSize = "1x1" | "2x1" | "2x2" | "3x2";
export type WidgetRole = "user" | "admin" | "all";

export type MockWidget = {
  widgetId: string;
  title: string;
  value: string;
  meta: string;
  size: WidgetSize;
  role: WidgetRole;
  status: WidgetStatus;
};

export type MockAnomalyLog = {
  logId: string;
  detectedAt: string;
  severity: "Critical" | "Warning" | "Info";
  status: "Detected" | "Open" | "Resolved";
  originalSeverity: "Critical" | "Warning" | "Info";
  processName: string;
  channelName: string;
  transactionId: string;
  responseCode: string;
  anomalyScore: number;
  summary: string;
};

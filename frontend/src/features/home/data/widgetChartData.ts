export const chartPalette = ["#4361ee", "#4cc9f0", "#7209b7", "#f72585", "#ffb703"];

export const transactionTrendData = [
  { time: "10:00", transactions: 120, anomalies: 2 },
  { time: "11:00", transactions: 150, anomalies: 5 },
  { time: "12:00", transactions: 180, anomalies: 1 },
  { time: "13:00", transactions: 220, anomalies: 8 },
  { time: "14:00", transactions: 170, anomalies: 3 },
  { time: "15:00", transactions: 190, anomalies: 12 },
  { time: "16:00", transactions: 140, anomalies: 4 },
  { time: "17:00", transactions: 160, anomalies: 2 },
  { time: "18:00", transactions: 130, anomalies: 1 },
];

export const interfaceAnomaliesData = [
  { name: "IF_ERP_001", value: 34 },
  { name: "IF_CRM_012", value: 27 },
  { name: "IF_BIL_005", value: 18 },
  { name: "IF_LOG_022", value: 12 },
  { name: "IF_HR_003", value: 8 },
];

export const riskDistributionData = [
  { name: "Critical", value: 14, color: "var(--error)" },
  { name: "Warning", value: 32, color: "var(--warning)" },
  { name: "Info", value: 58, color: "var(--link)" },
];

export const liveAnomaliesLogs = [
  { id: "LOG-9921", time: "방금 전", interfaceId: "IF_ERP_001", type: "Critical", msg: "Timeout exception in DB commit" },
  { id: "LOG-9920", time: "2분 전", interfaceId: "IF_CRM_012", type: "Warning", msg: "Response delay over 3000ms" },
  { id: "LOG-9919", time: "5분 전", interfaceId: "IF_BIL_005", type: "Warning", msg: "Invalid character set parsed" },
];

export const channelRiskData = [
  { name: "PAYMENT", value: 45 },
  { name: "TRANSFER", value: 28 },
  { name: "AUTH", value: 19 },
  { name: "CARD", value: 12 },
  { name: "LOAN", value: 5 },
];

export const deliveryData = [
  { name: "성공", value: 41, color: "var(--link)" },
  { name: "실패", value: 1, color: "var(--error)" },
];

export const epsTrendData = [
  { time: "14:15", eps: 1250 },
  { time: "14:16", eps: 1280 },
  { time: "14:17", eps: 1420 },
  { time: "14:18", eps: 980 },
  { time: "14:19", eps: 1350 },
  { time: "14:20", eps: 1290 },
];

export const systemMetricsData = [
  { name: "CPU", value: 42, color: "#4361ee" },
  { name: "Memory", value: 68, color: "#ffb703" },
  { name: "DB Load", value: 24, color: "#10b981" },
];

export const recentAlertsLogs = [
  { id: "ALT-01", time: "3분 전", channel: "Email", target: "admin@dgu.edu", msg: "Critical anomaly detected in IF_ERP_001" },
  { id: "ALT-02", time: "12분 전", channel: "Slack", target: "#alerts-esb", msg: "Response delay over 3000ms" },
  { id: "ALT-03", time: "1시간 전", channel: "Email", target: "operator@dgu.edu", msg: "Mail delivery failed (SMTP Timeout)" },
];

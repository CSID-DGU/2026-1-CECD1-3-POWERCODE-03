export type MockTimeSeriesPoint = {
  timestamp: string;
  value: number;
};

export type MockSeverityTrendPoint = MockTimeSeriesPoint & {
  critical: number;
  warning: number;
  info: number;
};

export const mockSeverityTrend: MockSeverityTrendPoint[] = [
  { timestamp: "2026-05-21T09:00:00+09:00", value: 11, critical: 2, warning: 5, info: 4 },
  { timestamp: "2026-05-21T10:00:00+09:00", value: 14, critical: 3, warning: 7, info: 4 },
  { timestamp: "2026-05-21T11:00:00+09:00", value: 9, critical: 1, warning: 4, info: 4 },
  { timestamp: "2026-05-21T12:00:00+09:00", value: 16, critical: 4, warning: 8, info: 4 },
  { timestamp: "2026-05-21T13:00:00+09:00", value: 13, critical: 2, warning: 6, info: 5 },
  { timestamp: "2026-05-21T14:00:00+09:00", value: 18, critical: 5, warning: 9, info: 4 },
];

export const mockThroughputTrend: MockTimeSeriesPoint[] = [
  { timestamp: "2026-05-21T09:00:00+09:00", value: 4200 },
  { timestamp: "2026-05-21T10:00:00+09:00", value: 5100 },
  { timestamp: "2026-05-21T11:00:00+09:00", value: 4860 },
  { timestamp: "2026-05-21T12:00:00+09:00", value: 6200 },
  { timestamp: "2026-05-21T13:00:00+09:00", value: 5440 },
  { timestamp: "2026-05-21T14:00:00+09:00", value: 6900 },
];

export const mockLatencyTrend: MockTimeSeriesPoint[] = [
  { timestamp: "2026-05-21T09:00:00+09:00", value: 218 },
  { timestamp: "2026-05-21T10:00:00+09:00", value: 244 },
  { timestamp: "2026-05-21T11:00:00+09:00", value: 201 },
  { timestamp: "2026-05-21T12:00:00+09:00", value: 337 },
  { timestamp: "2026-05-21T13:00:00+09:00", value: 286 },
  { timestamp: "2026-05-21T14:00:00+09:00", value: 412 },
];

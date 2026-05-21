import { useMemo } from "react";
import { mockAnomalyLogs } from "../testing/mocks/mockAnalysis";

export function useDashboardSummary() {
  return useMemo(() => {
    const criticalCount = mockAnomalyLogs.filter(
      (log) => log.severity === "Critical",
    ).length;
    const warningCount = mockAnomalyLogs.filter(
      (log) => log.severity === "Warning",
    ).length;
    const openCount = mockAnomalyLogs.filter((log) => log.status === "Open").length;
    const resolvedCount = mockAnomalyLogs.filter(
      (log) => log.status === "Resolved",
    ).length;

    return {
      criticalCount,
      warningCount,
      openCount,
      resolvedCount,
      totalCount: mockAnomalyLogs.length,
    };
  }, []);
}

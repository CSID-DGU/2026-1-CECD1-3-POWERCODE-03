import type { MockAnomalyDetail } from "../../../types/mock";
import type { AnalysisCategory } from "../types";

export const getDetailByLogId = (
  details: MockAnomalyDetail[],
  logId: string | null,
) => {
  if (!logId) {
    return null;
  }

  return details.find((detail) => detail.log.logId === logId) ?? null;
};

export const matchesCategory = (
  detail: MockAnomalyDetail,
  activeCategory: AnalysisCategory,
) => {
  if (activeCategory === "All") {
    return detail.log.status !== "Resolved";
  }

  if (activeCategory === "Open" || activeCategory === "Resolved") {
    return detail.log.status === activeCategory;
  }

  return (
    detail.log.status === "Detected" && detail.log.severity === activeCategory
  );
};

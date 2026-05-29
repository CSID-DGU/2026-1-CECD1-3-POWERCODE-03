import type { Icon } from "@tabler/icons-react";
import type { MockAnomalyLog } from "../../types/mock";

export type SeverityFilter = MockAnomalyLog["severity"];
export type AnalysisStatus = MockAnomalyLog["status"];
export type AnalysisCategory = "All" | SeverityFilter | "Open" | "Resolved";
export type StatusOverrides = Record<string, AnalysisStatus>;

export type CategoryTheme = {
  icon: Icon;
  label: string;
  group: "severity" | "workflow" | "all";
  className: string;
};

export type SortOption = "severity_desc" | "severity_asc" | "time_desc" | "time_asc";

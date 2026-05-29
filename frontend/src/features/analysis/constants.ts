import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFlame,
  IconFolderOpen,
  IconInbox,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { MockAnomalyLog } from "../../types/mock";
import type { AnalysisCategory, AnalysisStatus, CategoryTheme } from "./types";

export const categoryOrder: AnalysisCategory[] = [
  "All",
  "Critical",
  "Warning",
  "Info",
  "Open",
  "Resolved",
];

export const categoryThemeMap: Record<AnalysisCategory, CategoryTheme> = {
  All: {
    icon: IconInbox,
    label: "전체",
    group: "all",
    className: "analysis-theme--all",
  },
  Critical: {
    icon: IconFlame,
    label: "위험",
    group: "severity",
    className: "analysis-theme--critical",
  },
  Warning: {
    icon: IconAlertTriangle,
    label: "주의",
    group: "severity",
    className: "analysis-theme--warning",
  },
  Info: {
    icon: IconInfoCircle,
    label: "참고",
    group: "severity",
    className: "analysis-theme--info",
  },
  Open: {
    icon: IconFolderOpen,
    label: "보류",
    group: "workflow",
    className: "analysis-theme--open",
  },
  Resolved: {
    icon: IconCircleCheck,
    label: "완료",
    group: "workflow",
    className: "analysis-theme--resolved",
  },
};

export const severityToneMap: Record<
  MockAnomalyLog["severity"],
  "critical" | "warning" | "success"
> = {
  Critical: "critical",
  Warning: "warning",
  Info: "success",
};

export const statusToneMap: Record<
  MockAnomalyLog["status"],
  "default" | "success" | "warning"
> = {
  Detected: "warning",
  Open: "warning",
  Resolved: "success",
};

export const statusLabelMap: Record<AnalysisStatus, string> = {
  Detected: "감지됨",
  Open: "보류",
  Resolved: "완료",
};

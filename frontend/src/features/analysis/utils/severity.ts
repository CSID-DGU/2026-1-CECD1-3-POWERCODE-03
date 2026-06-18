import type { MockAnomalyLog } from "../../../types/mock";

export const getSeverityColor = (severity: MockAnomalyLog["severity"]) => {
  if (severity === "Critical") {
    return "var(--error)";
  }

  if (severity === "Warning") {
    return "var(--warning)";
  }

  return "var(--link)";
};

import type { MockAnomalyDetail } from "../../../types/mock";
import { formatCount, formatMs } from "./format";

export const getFeaturePreviewValue = (
  detail: MockAnomalyDetail,
  featureName: string,
) => {
  const failedProcess =
    detail.processes.find((process) => process.status === "F") ??
    detail.processes[0];

  if (featureName === "process_duration_ms") {
    return formatMs(detail.transaction.processTimeMs);
  }

  if (featureName === "has_missing_end_time") {
    return detail.processes.some((process) => !process.endTime)
      ? "true"
      : "false";
  }

  if (featureName === "is_failed_status") {
    return failedProcess?.status === "F" ? "true" : "false";
  }

  if (featureName === "response_code_group") {
    return detail.responseCodeDefinition.displayGroup;
  }

  if (featureName === "adapter_type_category") {
    return failedProcess?.adapterType ?? "-";
  }

  if (featureName === "channel_id_category") {
    return failedProcess?.channelId ?? "-";
  }

  if (featureName === "total_count_log") {
    return failedProcess
      ? `log1p(${formatCount(failedProcess.totalCount)})`
      : "-";
  }

  if (featureName === "error_ratio") {
    return failedProcess && failedProcess.totalCount > 0
      ? `${((0 / failedProcess.totalCount) * 100).toFixed(1)}%`
      : "0 또는 null";
  }

  if (featureName === "retry_count") {
    return `${failedProcess?.retryCount ?? 0}`;
  }

  if (featureName === "process_hour") {
    return detail.transaction.startTime.slice(11, 13);
  }

  if (featureName === "message_data_size_sum") {
    const sum = detail.messages.reduce(
      (total, message) => total + message.dataSize,
      0,
    );
    return formatCount(sum);
  }

  return "-";
};

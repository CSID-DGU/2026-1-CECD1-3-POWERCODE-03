import type {
  AnomalyDetailResponse,
  AnomalyListParams,
  AnomalyListResponse,
  UpdateAnomalyStatusRequest,
  UpdateAnomalyStatusResponse,
} from "../../types/api";
import { mockAnomalyDetails } from "../../testing/mocks/mockAnalysis";
import type { AnomalyDetail } from "../../types/domain";

import { httpClient } from "../api/client";

const severityRank = {
  Critical: 3,
  Warning: 2,
  Info: 1,
} as const;

let cachedDetails: AnomalyDetail[] | null = null;

export async function fetchAllAnomalyDetails(): Promise<AnomalyDetail[]> {
  if (cachedDetails) {
    return cachedDetails;
  }

  // 1. Prepare raw logs for backend evaluation
  const rawLogs = mockAnomalyDetails.map((detail) => ({
    logId: detail.log.logId,
    anomalyScore: detail.log.anomalyScore,
    processTimeMs: detail.transaction.processTimeMs,
    responseCode: detail.log.responseCode,
  }));

  try {
    // 2. Request risk scoring evaluation from the backend
    const response = await httpClient.post<{
      message: string;
      results: Array<{
        logId: string;
        riskScore: number;
        riskLevel: 1 | 2 | 3;
        severity: "Info" | "Warning" | "Critical";
      }>;
    }>("/api/anomaly/evaluate-risk", { logs: rawLogs });

    // 3. Map backend results back to the details list
    const resultsMap = new Map(response.results.map((r) => [r.logId, r]));

    cachedDetails = mockAnomalyDetails.map((detail) => {
      const result = resultsMap.get(detail.log.logId);
      if (result) {
        return {
          ...detail,
          log: {
            ...detail.log,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            severity: result.severity,
          },
        };
      }
      return detail;
    });
  } catch (error) {
    console.warn("Backend evaluation failed, falling back to mock client-side calculation:", error);
    // Fallback: local calculation (same formula as backend)
    cachedDetails = mockAnomalyDetails.map((detail) => {
      const anomalyScore = detail.log.anomalyScore;
      const processTimeMs = detail.transaction.processTimeMs;
      const responseCode = detail.log.responseCode;
      
      const modelScore = anomalyScore * 60;
      let codeScore = 0;
      if (responseCode !== "0000") {
        codeScore = responseCode.startsWith("4") ? 25 : 15;
      }
      const maxDelayThreshold = 300000;
      const delayScore = Math.min((processTimeMs / maxDelayThreshold) * 15, 15);
      const riskScore = Math.max(0, Math.min(100, Math.round(modelScore + codeScore + delayScore)));
      
      let riskLevel: 1 | 2 | 3 = 1;
      let severity: "Info" | "Warning" | "Critical" = "Info";
      if (riskScore >= 70) {
        riskLevel = 3;
        severity = "Critical";
      } else if (riskScore >= 40) {
        riskLevel = 2;
        severity = "Warning";
      } else {
        riskLevel = 1;
        severity = "Info";
      }

      return {
        ...detail,
        log: {
          ...detail.log,
          riskScore,
          riskLevel,
          severity,
        },
      };
    });
  }

  return cachedDetails;
}

export async function fetchAnomalyList(
  params: AnomalyListParams = {},
): Promise<AnomalyListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const keyword = params.keyword?.trim().toLowerCase();

  const details = await fetchAllAnomalyDetails();
  let items = details.map((detail) => detail.log);

  if (params.severity && params.severity !== "All") {
    items = items.filter((item) => item.severity === params.severity);
  }

  if (params.status) {
    items = items.filter((item) => item.status === params.status);
  }

  if (keyword) {
    items = items.filter((item) =>
      [
        item.processName,
        item.channelName,
        item.transactionId,
        item.responseCode,
        item.summary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }

  items = [...items].sort((a, b) => {
    if (params.sort === "severity_asc" || params.sort === "severity_desc") {
      const diff = severityRank[a.severity] - severityRank[b.severity];
      return params.sort === "severity_asc" ? diff : -diff;
    }

    const diff =
      new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
    return params.sort === "time_asc" ? diff : -diff;
  });

  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount: items.length,
  };
}

export async function fetchAnomalyDetail(
  anomalyId: string,
): Promise<AnomalyDetailResponse> {
  const details = await fetchAllAnomalyDetails();
  const detail = details.find(
    (item) => item.log.logId === anomalyId,
  );

  if (!detail) {
    throw new Error(`Anomaly detail not found: ${anomalyId}`);
  }

  return detail;
}

export async function updateAnomalyStatus(
  anomalyId: string,
  request: UpdateAnomalyStatusRequest,
): Promise<UpdateAnomalyStatusResponse> {
  const detail = await fetchAnomalyDetail(anomalyId);

  return {
    anomalyId,
    status: request.status,
    originalSeverity: detail.log.originalSeverity,
    updatedAt: new Date().toISOString(),
  };
}

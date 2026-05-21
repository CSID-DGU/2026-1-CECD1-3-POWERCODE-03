import type {
  AnomalyDetailResponse,
  AnomalyListParams,
  AnomalyListResponse,
  UpdateAnomalyStatusRequest,
  UpdateAnomalyStatusResponse,
} from "../../types/api";
import { mockAnomalyDetails } from "../../testing/mocks/mockAnalysis";
import type { AnomalyDetail } from "../../types/domain";

const severityRank = {
  Critical: 3,
  Warning: 2,
  Info: 1,
} as const;

export async function fetchAnomalyList(
  params: AnomalyListParams = {},
): Promise<AnomalyListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const keyword = params.keyword?.trim().toLowerCase();

  let items = mockAnomalyDetails.map((detail) => detail.log);

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
  const detail = mockAnomalyDetails.find(
    (item) => item.log.logId === anomalyId,
  );

  if (!detail) {
    throw new Error(`Anomaly detail not found: ${anomalyId}`);
  }

  return detail;
}

export async function fetchAllAnomalyDetails(): Promise<AnomalyDetail[]> {
  return mockAnomalyDetails;
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

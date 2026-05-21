import type {
  AnomalyDetail,
  AnomalyLog,
  AnomalyStatus,
  ScoreMethod,
  Severity,
} from "./domain";

export type SortOption =
  | "severity_desc"
  | "severity_asc"
  | "time_desc"
  | "time_asc";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type AnomalyListParams = PaginationParams & {
  severity?: Severity | "All";
  status?: AnomalyStatus;
  keyword?: string;
  from?: string;
  to?: string;
  sort?: SortOption;
};

export type AnomalyListResponse = {
  items: AnomalyLog[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type AnomalyDetailParams = {
  anomalyId: string;
};

export type AnomalyDetailResponse = AnomalyDetail;

export type UpdateAnomalyStatusRequest = {
  status: AnomalyStatus;
  memo?: string;
  updatedBy?: string;
};

export type UpdateAnomalyStatusResponse = {
  anomalyId: string;
  status: AnomalyStatus;
  originalSeverity: Severity;
  updatedAt: string;
};

export type ModelResultResponse = {
  anomalyScore: number;
  rawScore: number;
  severity: Severity;
  modelName: string;
  modelVersion: string;
  scoreMethod: ScoreMethod;
  threshold: {
    warning: number;
    critical: number;
  };
  featureImportance?: Array<{
    featureName: string;
    value: number | string | boolean | null;
    impact: "high" | "medium" | "low";
    description: string;
  }>;
};

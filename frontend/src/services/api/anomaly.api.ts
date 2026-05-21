import type {
  AnomalyDetailResponse,
  AnomalyListParams,
  AnomalyListResponse,
  UpdateAnomalyStatusRequest,
  UpdateAnomalyStatusResponse,
} from "../../types/api";
import { httpClient } from "./client";

export function fetchAnomalyList(
  params: AnomalyListParams,
): Promise<AnomalyListResponse> {
  return httpClient.get("/api/process-anomalies", { params });
}

export function fetchAnomalyDetail(
  anomalyId: string,
): Promise<AnomalyDetailResponse> {
  return httpClient.get(`/api/process-anomalies/${anomalyId}`);
}

export function updateAnomalyStatus(
  anomalyId: string,
  request: UpdateAnomalyStatusRequest,
): Promise<UpdateAnomalyStatusResponse> {
  return httpClient.patch(`/api/process-anomalies/${anomalyId}/status`, request);
}

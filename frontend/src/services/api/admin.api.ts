import type {
  AutoencoderConfig,
  EnsembleConfig,
  IforestConfig,
  ModelType,
  SystemConfig,
} from "../../types/domain";
import { httpClient } from "./client";

export function fetchSystemConfig(): Promise<SystemConfig> {
  return httpClient.get("/api/admin/system-config");
}

export function saveSystemConfig(config: SystemConfig): Promise<SystemConfig> {
  return httpClient.patch("/api/admin/system-config", config);
}

export function fetchModelConfig(
  type: ModelType,
): Promise<IforestConfig | AutoencoderConfig | EnsembleConfig> {
  return httpClient.get(`/api/admin/model-config/${type}`);
}

export function saveModelConfig(
  type: ModelType,
  config: IforestConfig | AutoencoderConfig | EnsembleConfig,
): Promise<IforestConfig | AutoencoderConfig | EnsembleConfig> {
  return httpClient.patch(`/api/admin/model-config/${type}`, config);
}

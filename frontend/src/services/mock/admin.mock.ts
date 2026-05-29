import { getStored, setStored, storageKeys } from "../../lib/storage";
import type {
  AutoencoderConfig,
  EnsembleConfig,
  IforestConfig,
  ModelType,
  SystemConfig,
} from "../../types/domain";
import {
  defaultAutoencoderConfig,
  defaultEnsembleConfig,
  defaultIforestConfig,
} from "../../features/admin_model/constants";

export const defaultSystemConfig: SystemConfig = {
  injectSpeedEps: 5000,
  anomalyRatio: 2.5,
  analysisInterval: 5,
  protocol: "gRPC",
  isStreamingActive: true,
  alertOnCpuThreshold: true,
  cpuAlertLimit: 85,
  retentionDays: 30,
};

export async function fetchSystemConfig(): Promise<SystemConfig> {
  return getStored(storageKeys.systemConfig, defaultSystemConfig);
}

export async function saveSystemConfig(config: SystemConfig): Promise<void> {
  setStored(storageKeys.systemConfig, config);
}

export async function fetchModelConfig(type: "iforest"): Promise<IforestConfig>;
export async function fetchModelConfig(
  type: "autoencoder",
): Promise<AutoencoderConfig>;
export async function fetchModelConfig(type: "ensemble"): Promise<EnsembleConfig>;
export async function fetchModelConfig(
  type: ModelType,
): Promise<IforestConfig | AutoencoderConfig | EnsembleConfig>;
export async function fetchModelConfig(type: ModelType) {
  const fallback = {
    iforest: defaultIforestConfig,
    autoencoder: defaultAutoencoderConfig,
    ensemble: defaultEnsembleConfig,
  }[type];

  return getStored(storageKeys.modelConfig(type), fallback);
}

export async function saveModelConfig(
  type: ModelType,
  config: IforestConfig | AutoencoderConfig | EnsembleConfig,
): Promise<void> {
  setStored(storageKeys.modelConfig(type), config);
}

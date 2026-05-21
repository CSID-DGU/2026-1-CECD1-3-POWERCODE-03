import { useEffect, useState } from "react";
import {
  defaultAutoencoderConfig,
  defaultEnsembleConfig,
  defaultIforestConfig,
} from "../features/admin_model/constants";
import { fetchModelConfig, saveModelConfig } from "../services/mock/admin.mock";
import type {
  AutoencoderConfig,
  EnsembleConfig,
  IforestConfig,
  ModelType,
} from "../types/domain";

type ModelConfigMap = {
  iforest: IforestConfig;
  autoencoder: AutoencoderConfig;
  ensemble: EnsembleConfig;
};

const defaultConfigMap: ModelConfigMap = {
  iforest: defaultIforestConfig,
  autoencoder: defaultAutoencoderConfig,
  ensemble: defaultEnsembleConfig,
};

export function useModelConfig<T extends ModelType>(type: T) {
  const [config, setConfig] = useState<ModelConfigMap[T]>(defaultConfigMap[type]);

  useEffect(() => {
    fetchModelConfig(type).then((response) => {
      setConfig(response as ModelConfigMap[T]);
    });
  }, [type]);

  const saveConfig = async (nextConfig: ModelConfigMap[T]) => {
    setConfig(nextConfig);
    await saveModelConfig(type, nextConfig);
  };

  return { config, setConfig, saveConfig };
}

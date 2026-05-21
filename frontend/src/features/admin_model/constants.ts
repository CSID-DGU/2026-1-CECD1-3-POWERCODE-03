import type {
  AutoencoderConfig,
  EnsembleConfig,
  IforestConfig,
} from "../../types/domain";

export const defaultIforestConfig: IforestConfig = {
  nEstimators: 100,
  contamination: 0.02,
  maxSamples: 256,
};

export const defaultAutoencoderConfig: AutoencoderConfig = {
  epochs: 50,
  batchSize: 64,
  learningRate: 0.001,
  latentDim: 8,
};

export const defaultEnsembleConfig: EnsembleConfig = {
  weightBalance: 0.5,
  voteThreshold: 2,
};

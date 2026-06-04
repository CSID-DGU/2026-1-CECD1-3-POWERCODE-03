import type { UserRole } from "./app";

export type WidgetStatus = "normal" | "warning" | "critical" | "empty";
export type WidgetSize = "1x1" | "2x1" | "2x2" | "3x2";
export type WidgetRole = UserRole | "all";

export type Widget = {
  widgetId: string;
  title: string;
  value: string;
  meta: string;
  description: string;
  supportingItems: string[];
  size: WidgetSize;
  role: WidgetRole;
  status: WidgetStatus;
};

export type Severity = "Critical" | "Warning" | "Info";
export type AnomalyStatus = "Detected" | "Open" | "Resolved";
export type ScoreMethod = "minMax" | "percentile" | "hybrid";

export type AnomalyLog = {
  logId: string;
  detectedAt: string;
  severity: Severity;
  status: AnomalyStatus;
  originalSeverity: Severity;
  processName: string;
  channelName: string;
  transactionId: string;
  responseCode: string;
  anomalyScore: number;
  riskScore: number;
  rawScore?: number;
  scoreMethod?: ScoreMethod;
  summary: string;
};

export type ResponseCodeDefinition = {
  code: string;
  enumName: string;
  type: string;
  httpStatus: string;
  messageKey: string;
  messageKo: string;
  severityHint: "normal" | "warning" | "critical" | "unknown";
  displayGroup: string;
};

export type RawDataSource =
  | "transaction"
  | "process"
  | "message"
  | "messageBody";
export type RawDataType = "string" | "number" | "datetime" | "json" | "unknown";
export type PrivacyLevel = "none" | "possiblePersonal" | "sensitive";

export type RawFieldDefinition = {
  source: RawDataSource;
  sourceFile: string;
  columnName: string;
  dataType: RawDataType;
  description: string;
  example?: string;
  privacyLevel: PrivacyLevel;
  isModelCandidate: boolean;
};

export type FeatureStage = "candidate" | "planned" | "confirmed";
export type FeatureDataType = "number" | "category" | "boolean" | "datetime";

export type ProcessFeatureDefinition = {
  featureName: string;
  sourceColumns: string[];
  dataType: FeatureDataType;
  stage: FeatureStage;
  preprocessing: string;
  description: string;
  reasonForUse: string;
};

export type TransactionSnapshot = {
  transactionId: string;
  interfaceId: string;
  interfaceType: string;
  categoryName: string;
  processHubId: string;
  startChannelId: string;
  endChannelId: string;
  processCount: number;
  status: string;
  responseCode: string;
  responseMessage: string;
  startTime: string;
  endTime: string;
  processTimeMs: number;
  retryCount: number;
};

export type ProcessSnapshot = {
  processId: string;
  dependsOn: string;
  adapterType: string;
  channelId: string;
  status: string;
  responseCode: string;
  responseMessage: string;
  startTime: string;
  endTime?: string;
  totalCount: number;
  successCount?: number;
  errorCount?: number;
  retryCount: number;
};

export type MessageSnapshot = {
  messageId: string;
  processId: string;
  dataType: string;
  dataName: string;
  status: string;
  responseCode?: string;
  responseMessage?: string;
  direction: "IN" | "OUT";
  dataSize: number;
  processedAt: string;
};

export type MessageBodyPreview = {
  messageId: string;
  source: "MESSAGE_BODY" | "MESSAGE_IN" | "MESSAGE_OUT";
  recordCount: number;
  fieldSummary: string[];
  privacyNote: string;
};

export type LlmReport = {
  reportId: string;
  logId: string;
  status: "idle" | "loading" | "success" | "error";
  summary: string;
  suspectedCause: string;
  recommendedAction: string;
  generatedAt?: string;
};

export type AnomalyDetail = {
  log: AnomalyLog;
  responseCodeDefinition: ResponseCodeDefinition;
  transaction: TransactionSnapshot;
  processes: ProcessSnapshot[];
  messages: MessageSnapshot[];
  bodyPreviews: MessageBodyPreview[];
  llmReport: LlmReport;
  evidence: string[];
};

export type SystemConfig = {
  injectSpeedEps: number;
  anomalyRatio: number;
  analysisInterval: 1 | 5 | 10;
  protocol: "gRPC" | "REST";
  isStreamingActive: boolean;
  alertOnCpuThreshold: boolean;
  cpuAlertLimit: number;
  retentionDays: number;
};

export type UserSettings = {
  dashboardNotification: boolean;
  emailNotification: boolean;
  slackNotification: boolean;
  compactMode: boolean;
  focusMode: boolean;
};

export type GpuState = {
  id: number;
  name: string;
  load: number;
  vramUsed: number;
  vramTotal: number;
  temp: number;
  fanSpeed: number;
  status: "healthy" | "warning" | "critical";
};

export type ModelType = "iforest" | "autoencoder" | "ensemble";

export type IforestConfig = {
  nEstimators: number;
  contamination: number;
  maxSamples: number;
};

export type AutoencoderConfig = {
  epochs: number;
  batchSize: number;
  learningRate: number;
  latentDim: number;
};

export type EnsembleConfig = {
  weightBalance: number;
  voteThreshold: number;
};

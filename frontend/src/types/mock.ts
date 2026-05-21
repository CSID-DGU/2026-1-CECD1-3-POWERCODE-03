import type {
  AnomalyDetail,
  AnomalyLog,
  AutoencoderConfig,
  EnsembleConfig,
  FeatureDataType,
  FeatureStage,
  GpuState,
  IforestConfig,
  LlmReport,
  MessageBodyPreview,
  MessageSnapshot,
  ModelType,
  PrivacyLevel,
  ProcessFeatureDefinition,
  ProcessSnapshot,
  RawDataSource,
  RawDataType,
  RawFieldDefinition,
  ResponseCodeDefinition,
  SystemConfig,
  TransactionSnapshot,
  Widget,
  WidgetRole,
  WidgetSize,
  WidgetStatus,
} from "./domain";

export type MockWidgetStatus = WidgetStatus;
export type { WidgetStatus, WidgetSize, WidgetRole };
export type MockWidgetSize = WidgetSize;
export type MockWidgetRole = WidgetRole;
export type MockWidget = Widget;
export type MockAnomalyLog = AnomalyLog;
export type MockResponseCodeDefinition = ResponseCodeDefinition;
export type MockRawDataSource = RawDataSource;
export type MockRawDataType = RawDataType;
export type MockPrivacyLevel = PrivacyLevel;
export type MockRawFieldDefinition = RawFieldDefinition;
export type MockFeatureStage = FeatureStage;
export type MockFeatureDataType = FeatureDataType;
export type MockProcessFeatureDefinition = ProcessFeatureDefinition;
export type MockTransactionSnapshot = TransactionSnapshot;
export type MockProcessSnapshot = ProcessSnapshot;
export type MockMessageSnapshot = MessageSnapshot;
export type MockMessageBodyPreview = MessageBodyPreview;
export type MockLlmReport = LlmReport;
export type MockAnomalyDetail = AnomalyDetail;
export type MockSystemConfig = SystemConfig;
export type MockGpuState = GpuState;
export type MockModelType = ModelType;
export type MockIforestConfig = IforestConfig;
export type MockAutoencoderConfig = AutoencoderConfig;
export type MockEnsembleConfig = EnsembleConfig;

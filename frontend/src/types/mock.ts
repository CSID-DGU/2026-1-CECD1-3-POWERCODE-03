export type WidgetStatus = "normal" | "warning" | "critical" | "empty";
export type WidgetSize = "1x1" | "2x1" | "2x2" | "3x2";
export type WidgetRole = "user" | "admin" | "all";

export type MockWidget = {
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

export type MockAnomalyLog = {
  logId: string;
  detectedAt: string;
  severity: "Critical" | "Warning" | "Info";
  status: "Detected" | "Open" | "Resolved";
  originalSeverity: "Critical" | "Warning" | "Info";
  processName: string;
  channelName: string;
  transactionId: string;
  responseCode: string;
  anomalyScore: number;
  summary: string;
};

export type MockResponseCodeDefinition = {
  code: string;
  enumName: string;
  type: string;
  httpStatus: string;
  messageKey: string;
  messageKo: string;
  severityHint: "normal" | "warning" | "critical" | "unknown";
  displayGroup: string;
};

export type MockRawDataSource = "transaction" | "process" | "message" | "messageBody";
export type MockRawDataType = "string" | "number" | "datetime" | "json" | "unknown";
export type MockPrivacyLevel = "none" | "possiblePersonal" | "sensitive";

export type MockRawFieldDefinition = {
  source: MockRawDataSource;
  sourceFile: string;
  columnName: string;
  dataType: MockRawDataType;
  description: string;
  example?: string;
  privacyLevel: MockPrivacyLevel;
  isModelCandidate: boolean;
};

export type MockFeatureStage = "candidate" | "planned" | "confirmed";
export type MockFeatureDataType = "number" | "category" | "boolean" | "datetime";

export type MockProcessFeatureDefinition = {
  featureName: string;
  sourceColumns: string[];
  dataType: MockFeatureDataType;
  stage: MockFeatureStage;
  preprocessing: string;
  description: string;
  reasonForUse: string;
};

export type MockTransactionSnapshot = {
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

export type MockProcessSnapshot = {
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
  retryCount: number;
};

export type MockMessageSnapshot = {
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

export type MockMessageBodyPreview = {
  messageId: string;
  source: "MESSAGE_BODY" | "MESSAGE_IN" | "MESSAGE_OUT";
  recordCount: number;
  fieldSummary: string[];
  privacyNote: string;
};

export type MockLlmReport = {
  reportId: string;
  logId: string;
  status: "idle" | "loading" | "success" | "error";
  summary: string;
  suspectedCause: string;
  recommendedAction: string;
  generatedAt?: string;
};

export type MockAnomalyDetail = {
  log: MockAnomalyLog;
  responseCodeDefinition: MockResponseCodeDefinition;
  transaction: MockTransactionSnapshot;
  processes: MockProcessSnapshot[];
  messages: MockMessageSnapshot[];
  bodyPreviews: MockMessageBodyPreview[];
  llmReport: MockLlmReport;
  evidence: string[];
};

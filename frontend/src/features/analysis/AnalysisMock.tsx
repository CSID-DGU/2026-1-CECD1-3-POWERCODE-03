import {
  IconAlertTriangle,
  IconBinaryTree,
  IconBrain,
  IconCircleCheck,
  IconClipboard,
  IconCodeDots,
  IconDatabase,
  IconFileAnalytics,
  IconFilter,
  IconFolderOpen,
  IconMessage2,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { mockAnomalyDetails } from "../../testing/mocks/mockAnalysis";
import { mockProcessFeatureDefinitions } from "../../testing/mocks/mockFeatureSchemas";
import { mockProcessRawFieldDefinitions } from "../../testing/mocks/mockRawSchemas";
import type { MockAnomalyDetail, MockAnomalyLog } from "../../types/mock";

type SeverityFilter = MockAnomalyLog["severity"] | "All";
type AnalysisStatus = MockAnomalyLog["status"];
type AnalysisTab = SeverityFilter | "Open" | "Resolved";
type StatusOverrides = Record<string, AnalysisStatus>;

const analysisTabs: AnalysisTab[] = ["All", "Critical", "Warning", "Info", "Open", "Resolved"];

const severityToneMap: Record<MockAnomalyLog["severity"], "critical" | "warning" | "success"> = {
  Critical: "critical",
  Warning: "warning",
  Info: "success",
};

const statusToneMap: Record<MockAnomalyLog["status"], "default" | "success" | "warning"> = {
  Detected: "warning",
  Open: "warning",
  Resolved: "success",
};

const formatMs = (ms: number) => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${ms}ms`;
};

const formatCount = (count: number) => count.toLocaleString("ko-KR");

const getFeaturePreviewValue = (detail: MockAnomalyDetail, featureName: string) => {
  const failedProcess = detail.processes.find((process) => process.status === "F") ?? detail.processes[0];

  if (featureName === "process_duration_ms") {
    return formatMs(detail.transaction.processTimeMs);
  }

  if (featureName === "has_missing_end_time") {
    return detail.processes.some((process) => !process.endTime) ? "true" : "false";
  }

  if (featureName === "is_failed_status") {
    return failedProcess?.status === "F" ? "true" : "false";
  }

  if (featureName === "response_code_group") {
    return detail.responseCodeDefinition.displayGroup;
  }

  if (featureName === "adapter_type_category") {
    return failedProcess?.adapterType ?? "-";
  }

  if (featureName === "channel_id_category") {
    return failedProcess?.channelId ?? "-";
  }

  if (featureName === "total_count_log") {
    return failedProcess ? `log1p(${formatCount(failedProcess.totalCount)})` : "-";
  }

  if (featureName === "error_ratio") {
    return failedProcess && failedProcess.totalCount > 0 ? `${((0 / failedProcess.totalCount) * 100).toFixed(1)}%` : "0 또는 null";
  }

  if (featureName === "retry_count") {
    return `${failedProcess?.retryCount ?? 0}`;
  }

  if (featureName === "process_hour") {
    return detail.transaction.startTime.slice(11, 13);
  }

  if (featureName === "message_data_size_sum") {
    const sum = detail.messages.reduce((total, message) => total + message.dataSize, 0);
    return formatCount(sum);
  }

  return "-";
};

export const AnalysisMock = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("All");
  const [selectedLogId, setSelectedLogId] = useState(mockAnomalyDetails[0].log.logId);
  const [query, setQuery] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<StatusOverrides>({});

  const detailsWithStatus = useMemo(() => {
    return mockAnomalyDetails.map((detail) => ({
      ...detail,
      log: {
        ...detail.log,
        status: statusOverrides[detail.log.logId] ?? detail.log.status,
      },
    }));
  }, [statusOverrides]);

  const tabCounts = useMemo(() => {
    return detailsWithStatus.reduce<Record<AnalysisTab, number>>(
      (counts, detail) => {
        if (detail.log.status !== "Resolved") {
          counts.All += 1;
        }

        if (detail.log.status === "Detected") {
          counts[detail.log.severity] += 1;
        }

        if (detail.log.status === "Open") {
          counts.Open += 1;
        }

        if (detail.log.status === "Resolved") {
          counts.Resolved += 1;
        }

        return counts;
      },
      { All: 0, Critical: 0, Warning: 0, Info: 0, Open: 0, Resolved: 0 },
    );
  }, [detailsWithStatus]);

  const filteredDetails = useMemo(() => {
    return detailsWithStatus.filter((detail) => {
      const matchesTab =
        activeTab === "All"
          ? detail.log.status !== "Resolved"
          : activeTab === "Open" || activeTab === "Resolved"
            ? detail.log.status === activeTab
            : detail.log.status === "Detected" && detail.log.severity === activeTab;
      const searchable = `${detail.log.summary} ${detail.log.processName} ${detail.log.channelName} ${detail.log.transactionId} ${detail.log.responseCode}`;
      const matchesQuery = searchable.toLowerCase().includes(query.trim().toLowerCase());

      return matchesTab && matchesQuery;
    });
  }, [activeTab, detailsWithStatus, query]);

  const selectedDetail =
    filteredDetails.find((detail) => detail.log.logId === selectedLogId) ?? filteredDetails[0] ?? detailsWithStatus[0];

  const handleStatusChange = (logId: string, nextStatus: AnalysisStatus) => {
    setStatusOverrides((current) => ({
      ...current,
      [logId]: nextStatus,
    }));
    setSelectedLogId(logId);

    if (nextStatus === "Open") {
      setActiveTab("Open");
      toast.success("Open 목록으로 이동했습니다.");
      return;
    }

    if (nextStatus === "Resolved") {
      setActiveTab("Resolved");
      toast.success("Resolved 처리했습니다.");
      return;
    }

    toast.success("감지 상태로 복구했습니다.");
  };

  const handleCopyReport = async () => {
    const report = selectedDetail.llmReport;
    const text = [`요약: ${report.summary}`, `원인 후보: ${report.suspectedCause}`, `권장 조치: ${report.recommendedAction}`].join("\n");

    try {
      if (!navigator.clipboard?.writeText) {
        toast.error("이 브라우저에서는 클립보드 복사를 사용할 수 없습니다.");
        return;
      }

      await navigator.clipboard.writeText(text);
      toast.success("LLM 리포트 내용을 복사했습니다.");
    } catch {
      toast.error("브라우저 권한 때문에 복사하지 못했습니다.");
    }
  };

  return (
    <TooltipProvider>
      <section className="analysis-workspace">
        <div className="analysis-toolbar">
          <div>
            <p className="eyebrow">Anomaly analysis</p>
            <h2>상세 분석</h2>
          </div>
          <div className="analysis-toolbar__actions">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <IconFileAnalytics size={16} aria-hidden="true" />
                  스키마 보기
                </Button>
              </DialogTrigger>
              <DialogContent className="analysis-schema-dialog">
                <DialogHeader>
                  <DialogTitle>프로세스 기준 원본/피처 스키마</DialogTitle>
                  <DialogDescription>현재 AI 입력은 프로세스 단위 후보 피처를 우선 검토합니다.</DialogDescription>
                </DialogHeader>
                <SchemaDialogContent />
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconFilter size={16} aria-hidden="true" />
                  <span className="sr-only">필터 도움말</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>상단 필터는 목업이며 severity와 검색어만 동작합니다.</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="analysis-layout">
          <aside className="analysis-list-panel">
            <div className="analysis-search">
              <IconSearch size={16} aria-hidden="true" />
              <input value={query} placeholder="Process, Channel, 응답코드 검색" onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="analysis-severity-tabs">
              {analysisTabs.map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "analysis-severity-tab analysis-severity-tab--active" : "analysis-severity-tab"}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                  <strong>{tabCounts[tab]}</strong>
                </button>
              ))}
            </div>
            <div className="analysis-log-list">
              {filteredDetails.length > 0 ? (
                filteredDetails.map((detail) => (
                  <button
                    key={detail.log.logId}
                    className={selectedDetail.log.logId === detail.log.logId ? "analysis-log-card analysis-log-card--active" : "analysis-log-card"}
                    type="button"
                    onClick={() => setSelectedLogId(detail.log.logId)}
                  >
                    <span className="analysis-log-card__header">
                      <span className="analysis-log-card__badges">
                        <Badge variant={severityToneMap[detail.log.severity]}>{detail.log.severity}</Badge>
                        {detail.log.status !== "Detected" && <Badge variant={statusToneMap[detail.log.status]}>{detail.log.status}</Badge>}
                      </span>
                      <span>{detail.log.detectedAt.slice(5, 16)}</span>
                    </span>
                    <strong>{detail.log.processName}</strong>
                    <span>{detail.log.summary}</span>
                  </button>
                ))
              ) : (
                <p className="analysis-empty-text">조건에 맞는 이상 로그가 없습니다.</p>
              )}
            </div>
          </aside>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDetail.log.logId}
              animate={{ opacity: 1, y: 0 }}
              className="analysis-detail-panel"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              <EventSummary detail={selectedDetail} onStatusChange={handleStatusChange} />
              <div className="analysis-detail-grid">
                <ResponseCodeSection detail={selectedDetail} />
                <TransactionSection detail={selectedDetail} />
              </div>
              <ProcessSection detail={selectedDetail} />
              <MessageSection detail={selectedDetail} />
              <FeatureSection detail={selectedDetail} />
              <LlmSection detail={selectedDetail} onCopyReport={handleCopyReport} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </TooltipProvider>
  );
};

const EventSummary = ({
  detail,
  onStatusChange,
}: {
  detail: MockAnomalyDetail;
  onStatusChange: (logId: string, nextStatus: AnalysisStatus) => void;
}) => (
  <section className="analysis-summary-card">
    <div>
      <div className="analysis-summary-card__badges">
        <Badge variant={severityToneMap[detail.log.severity]}>{detail.log.severity}</Badge>
        <Badge variant={statusToneMap[detail.log.status]}>{detail.log.status}</Badge>
      </div>
      <h3>{detail.log.summary}</h3>
      <p>{detail.log.transactionId}</p>
      <div className="analysis-status-actions">
        {detail.log.status !== "Open" && (
          <Button variant="outline" size="sm" onClick={() => onStatusChange(detail.log.logId, "Open")}>
            <IconFolderOpen size={16} aria-hidden="true" />
            Open 전환
          </Button>
        )}
        {detail.log.status !== "Resolved" && (
          <Button size="sm" onClick={() => onStatusChange(detail.log.logId, "Resolved")}>
            <IconCircleCheck size={16} aria-hidden="true" />
            Resolved 처리
          </Button>
        )}
        {detail.log.status === "Resolved" && (
          <Button variant="outline" size="sm" onClick={() => onStatusChange(detail.log.logId, "Detected")}>
            <IconRefresh size={16} aria-hidden="true" />
            감지 상태 복구
          </Button>
        )}
      </div>
    </div>
    <div className="analysis-score">
      <span>Score</span>
      <strong>{detail.log.anomalyScore.toFixed(2)}</strong>
    </div>
  </section>
);

const ResponseCodeSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle icon={<IconAlertTriangle size={18} aria-hidden="true" />} title="응답코드" />
    <div className="analysis-code-card">
      <strong>{detail.responseCodeDefinition.code}</strong>
      <div>
        <p>{detail.responseCodeDefinition.messageKo}</p>
        <span>{detail.responseCodeDefinition.enumName}</span>
      </div>
      <Badge variant={detail.responseCodeDefinition.severityHint === "critical" ? "critical" : "warning"}>
        {detail.responseCodeDefinition.displayGroup}
      </Badge>
    </div>
  </section>
);

const TransactionSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle icon={<IconDatabase size={18} aria-hidden="true" />} title="Transaction" />
    <dl className="analysis-kv-grid">
      <div>
        <dt>Interface</dt>
        <dd>{detail.transaction.interfaceId}</dd>
      </div>
      <div>
        <dt>Channel</dt>
        <dd>
          {detail.transaction.startChannelId} → {detail.transaction.endChannelId}
        </dd>
      </div>
      <div>
        <dt>처리시간</dt>
        <dd>{formatMs(detail.transaction.processTimeMs)}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{detail.transaction.status}</dd>
      </div>
    </dl>
  </section>
);

const ProcessSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle icon={<IconBinaryTree size={18} aria-hidden="true" />} title="Process Flow" />
    <div className="analysis-process-list">
      {detail.processes.map((process) => (
        <article key={process.processId} className="analysis-process-item">
          <span className={`analysis-process-status analysis-process-status--${process.status.toLowerCase()}`}>{process.status}</span>
          <div>
            <strong>{process.processId}</strong>
            <p>
              {process.adapterType} / {process.channelId} / total {formatCount(process.totalCount)}
            </p>
            {process.responseMessage && <small>{process.responseMessage}</small>}
          </div>
        </article>
      ))}
    </div>
  </section>
);

const MessageSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle icon={<IconMessage2 size={18} aria-hidden="true" />} title="Messages" />
    <div className="analysis-message-table">
      <div className="analysis-message-table__head">
        <span>Direction</span>
        <span>Data</span>
        <span>Status</span>
        <span>Size</span>
      </div>
      {detail.messages.length > 0 ? (
        detail.messages.map((message) => (
          <div key={`${message.messageId}-${message.direction}`} className="analysis-message-row">
            <span>{message.direction}</span>
            <span>{message.dataName || message.dataType}</span>
            <span>{message.status}</span>
            <span>{formatCount(message.dataSize)}</span>
          </div>
        ))
      ) : (
        <p className="analysis-empty-text">연결된 message snapshot이 없습니다.</p>
      )}
    </div>
    {detail.bodyPreviews.length > 0 && (
      <div className="analysis-body-preview">
        <strong>Body preview</strong>
        {detail.bodyPreviews.map((preview) => (
          <p key={preview.messageId}>
            {preview.recordCount} rows / {preview.fieldSummary.join(", ")} · {preview.privacyNote}
          </p>
        ))}
      </div>
    )}
  </section>
);

const FeatureSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle icon={<IconCodeDots size={18} aria-hidden="true" />} title="Process Features" />
    <div className="analysis-feature-grid">
      {mockProcessFeatureDefinitions.slice(0, 8).map((feature) => (
        <article key={feature.featureName} className="analysis-feature-item">
          <span>{feature.stage}</span>
          <strong>{feature.featureName}</strong>
          <p>{getFeaturePreviewValue(detail, feature.featureName)}</p>
        </article>
      ))}
    </div>
  </section>
);

const LlmSection = ({ detail, onCopyReport }: { detail: MockAnomalyDetail; onCopyReport: () => void }) => (
  <section className="analysis-section-card analysis-llm-card">
    <SectionTitle icon={<IconBrain size={18} aria-hidden="true" />} title="LLM Report" />
    {detail.llmReport.status === "idle" ? (
      <div className="analysis-llm-empty">
        <p>아직 LLM 분석을 요청하지 않은 이벤트입니다.</p>
        <Button size="sm">
          <IconBrain size={16} aria-hidden="true" />
          분석 요청
        </Button>
      </div>
    ) : (
      <>
        <p>{detail.llmReport.summary}</p>
        <dl className="analysis-llm-list">
          <div>
            <dt>원인 후보</dt>
            <dd>{detail.llmReport.suspectedCause}</dd>
          </div>
          <div>
            <dt>권장 조치</dt>
            <dd>{detail.llmReport.recommendedAction}</dd>
          </div>
        </dl>
        <Button variant="outline" size="sm" onClick={onCopyReport}>
          <IconClipboard size={16} aria-hidden="true" />
          리포트 복사
        </Button>
      </>
    )}
  </section>
);

const SchemaDialogContent = () => (
  <div className="analysis-schema-content">
    <section>
      <h4>원본 Process 컬럼</h4>
      <div className="analysis-schema-list">
        {mockProcessRawFieldDefinitions.slice(0, 8).map((field) => (
          <article key={field.columnName}>
            <strong>{field.columnName}</strong>
            <p>{field.description}</p>
          </article>
        ))}
      </div>
    </section>
    <section>
      <h4>피처 후보</h4>
      <div className="analysis-schema-list">
        {mockProcessFeatureDefinitions.slice(0, 8).map((feature) => (
          <article key={feature.featureName}>
            <strong>{feature.featureName}</strong>
            <p>{feature.preprocessing}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);

const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="analysis-section-title">
    {icon}
    <h3>{title}</h3>
  </div>
);

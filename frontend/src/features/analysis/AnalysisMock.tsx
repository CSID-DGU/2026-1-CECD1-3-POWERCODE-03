import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBinaryTree,
  IconBrain,
  IconChartBar,
  IconCircleCheck,
  IconClipboard,
  IconClock,
  IconCodeDots,
  IconDatabase,
  IconFileAnalytics,
  IconFlame,
  IconFolderOpen,
  IconInbox,
  IconInfoCircle,
  IconListDetails,
  IconMaximize,
  IconMessage2,
  IconRefresh,
  IconSearch,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import {
  SidebarNav,
  type SidebarNavGroup,
} from "../../components/layout/SidebarNav";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { mockAnomalyDetails } from "../../testing/mocks/mockAnalysis";
import { mockProcessFeatureDefinitions } from "../../testing/mocks/mockFeatureSchemas";
import { mockProcessRawFieldDefinitions } from "../../testing/mocks/mockRawSchemas";
import type { MockAnomalyDetail, MockAnomalyLog } from "../../types/mock";

type SeverityFilter = MockAnomalyLog["severity"];
type AnalysisStatus = MockAnomalyLog["status"];
type AnalysisCategory = "All" | SeverityFilter | "Open" | "Resolved";
type StatusOverrides = Record<string, AnalysisStatus>;
type IconComponent = typeof IconInbox;

type CategoryTheme = {
  icon: IconComponent;
  label: string;
  group: "severity" | "workflow" | "all";
  className: string;
};

const categoryOrder: AnalysisCategory[] = [
  "All",
  "Critical",
  "Warning",
  "Info",
  "Open",
  "Resolved",
];

const categoryThemeMap: Record<AnalysisCategory, CategoryTheme> = {
  All: {
    icon: IconInbox,
    label: "전체",
    group: "all",
    className: "analysis-theme--all",
  },
  Critical: {
    icon: IconFlame,
    label: "위험",
    group: "severity",
    className: "analysis-theme--critical",
  },
  Warning: {
    icon: IconAlertTriangle,
    label: "주의",
    group: "severity",
    className: "analysis-theme--warning",
  },
  Info: {
    icon: IconInfoCircle,
    label: "참고",
    group: "severity",
    className: "analysis-theme--info",
  },
  Open: {
    icon: IconFolderOpen,
    label: "보류",
    group: "workflow",
    className: "analysis-theme--open",
  },
  Resolved: {
    icon: IconCircleCheck,
    label: "완료",
    group: "workflow",
    className: "analysis-theme--resolved",
  },
};

const severityToneMap: Record<
  MockAnomalyLog["severity"],
  "critical" | "warning" | "success"
> = {
  Critical: "critical",
  Warning: "warning",
  Info: "success",
};

const statusToneMap: Record<
  MockAnomalyLog["status"],
  "default" | "success" | "warning"
> = {
  Detected: "warning",
  Open: "warning",
  Resolved: "success",
};

const statusLabelMap: Record<AnalysisStatus, string> = {
  Detected: "감지됨",
  Open: "보류",
  Resolved: "완료",
};

const formatMs = (ms: number) => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${ms}ms`;
};

const formatCount = (count: number) => count.toLocaleString("ko-KR");

const getFeaturePreviewValue = (
  detail: MockAnomalyDetail,
  featureName: string,
) => {
  const failedProcess =
    detail.processes.find((process) => process.status === "F") ??
    detail.processes[0];

  if (featureName === "process_duration_ms") {
    return formatMs(detail.transaction.processTimeMs);
  }

  if (featureName === "has_missing_end_time") {
    return detail.processes.some((process) => !process.endTime)
      ? "true"
      : "false";
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
    return failedProcess
      ? `log1p(${formatCount(failedProcess.totalCount)})`
      : "-";
  }

  if (featureName === "error_ratio") {
    return failedProcess && failedProcess.totalCount > 0
      ? `${((0 / failedProcess.totalCount) * 100).toFixed(1)}%`
      : "0 또는 null";
  }

  if (featureName === "retry_count") {
    return `${failedProcess?.retryCount ?? 0}`;
  }

  if (featureName === "process_hour") {
    return detail.transaction.startTime.slice(11, 13);
  }

  if (featureName === "message_data_size_sum") {
    const sum = detail.messages.reduce(
      (total, message) => total + message.dataSize,
      0,
    );
    return formatCount(sum);
  }

  return "-";
};

const getDetailByLogId = (
  details: MockAnomalyDetail[],
  logId: string | null,
) => {
  if (!logId) {
    return null;
  }

  return details.find((detail) => detail.log.logId === logId) ?? null;
};

const matchesCategory = (
  detail: MockAnomalyDetail,
  activeCategory: AnalysisCategory,
) => {
  if (activeCategory === "All") {
    return detail.log.status !== "Resolved";
  }

  if (activeCategory === "Open" || activeCategory === "Resolved") {
    return detail.log.status === activeCategory;
  }

  return (
    detail.log.status === "Detected" && detail.log.severity === activeCategory
  );
};

export const AnalysisMock = () => {
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory>("All");
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
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

  const categoryCounts = useMemo(() => {
    return detailsWithStatus.reduce<Record<AnalysisCategory, number>>(
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
      const searchable = `${detail.log.summary} ${detail.log.processName} ${detail.log.channelName} ${detail.log.transactionId} ${detail.log.responseCode}`;
      const matchesQuery = searchable
        .toLowerCase()
        .includes(query.trim().toLowerCase());

      return matchesCategory(detail, activeCategory) && matchesQuery;
    });
  }, [activeCategory, detailsWithStatus, query]);

  const activeDetail = getDetailByLogId(detailsWithStatus, activeDetailId);
  const activeTheme = activeDetail
    ? categoryThemeMap[activeDetail.log.severity]
    : categoryThemeMap[activeCategory];
  const sidebarGroups = useMemo<SidebarNavGroup<AnalysisCategory>[]>(() => {
    return [
      {
        title: "이상 로그",
        items: categoryOrder
          .filter((category) => categoryThemeMap[category].group !== "workflow")
          .map((category) => {
            const theme = categoryThemeMap[category];
            const Icon = theme.icon;

            return {
              id: category,
              label: theme.label,
              count: categoryCounts[category],
              icon: <Icon size={17} aria-hidden="true" />,
              className: theme.className,
            };
          }),
      },
      {
        title: "분류함",
        items: categoryOrder
          .filter((category) => categoryThemeMap[category].group === "workflow")
          .map((category) => {
            const theme = categoryThemeMap[category];
            const Icon = theme.icon;

            return {
              id: category,
              label: theme.label,
              count: categoryCounts[category],
              icon: <Icon size={17} aria-hidden="true" />,
              className: theme.className,
            };
          }),
      },
    ];
  }, [categoryCounts]);

  const handleCategoryChange = (category: AnalysisCategory) => {
    setActiveCategory(category);
    setActiveDetailId(null);
  };

  const handleStatusChange = (logId: string, nextStatus: AnalysisStatus) => {
    setStatusOverrides((current) => ({
      ...current,
      [logId]: nextStatus,
    }));

    if (nextStatus === "Open") {
      setActiveCategory("Open");
      toast.success("보류 목록으로 이동했습니다.");
      return;
    }

    if (nextStatus === "Resolved") {
      setActiveCategory("Resolved");
      toast.success("완료 목록으로 이동했습니다.");
      return;
    }

    toast.success("감지 상태로 복구했습니다.");
  };

  const handleCopyReport = async () => {
    if (!activeDetail) {
      return;
    }

    const report = activeDetail.llmReport;
    const text = [
      `요약: ${report.summary}`,
      `원인 후보: ${report.suspectedCause}`,
      `권장 조치: ${report.recommendedAction}`,
    ].join("\n");

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
        <SidebarNav
          activeId={activeCategory}
          groups={sidebarGroups}
          onSelect={handleCategoryChange}
        />
        <main className="analysis-main">
          <AnimatePresence mode="wait">
            {activeDetail ? (
              <AnalysisDetailView
                key={activeDetail.log.logId}
                detail={activeDetail}
                theme={activeTheme}
                onBack={() => setActiveDetailId(null)}
                onCopyReport={handleCopyReport}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <AnalysisInboxView
                key={activeCategory}
                activeCategory={activeCategory}
                categoryCounts={categoryCounts}
                details={filteredDetails}
                query={query}
                onOpenDetail={setActiveDetailId}
                onQueryChange={setQuery}
              />
            )}
          </AnimatePresence>
        </main>
      </section>
    </TooltipProvider>
  );
};

const AnalysisInboxView = ({
  activeCategory,
  categoryCounts,
  details,
  query,
  onOpenDetail,
  onQueryChange,
}: {
  activeCategory: AnalysisCategory;
  categoryCounts: Record<AnalysisCategory, number>;
  details: MockAnomalyDetail[];
  query: string;
  onOpenDetail: (logId: string) => void;
  onQueryChange: (query: string) => void;
}) => {
  const theme = categoryThemeMap[activeCategory];
  const Icon = theme.icon;

  return (
    <AnimatedPanel className="analysis-inbox">
      <header className="analysis-inbox__header">
        <div>
          {/* <p className="eyebrow">Anomaly inbox</p> */}
          <h2>
            <span className={`analysis-heading-icon ${theme.className}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            {theme.label} 이상 로그
          </h2>
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
                <DialogDescription>
                  현재 AI 입력은 프로세스 단위 후보 피처를 우선 검토합니다.
                </DialogDescription>
              </DialogHeader>
              <SchemaDialogContent />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <section className="analysis-inbox-summary">
        <SummaryMetric label="현재 목록" value={`${details.length}건`} />
        <SummaryMetric label="전체 미처리" value={`${categoryCounts.All}건`} />
        <SummaryMetric label="보류" value={`${categoryCounts.Open}건`} />
        <SummaryMetric label="완료" value={`${categoryCounts.Resolved}건`} />
      </section>
      <div className="analysis-search analysis-search--wide">
        <IconSearch size={16} aria-hidden="true" />
        <input
          value={query}
          placeholder="Process, Channel, Transaction ID, 응답코드 검색"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <section className="analysis-inbox-list" aria-label="이상 로그 목록">
        {details.length > 0 ? (
          details.map((detail) => (
            <InboxRow
              key={detail.log.logId}
              detail={detail}
              onOpen={() => onOpenDetail(detail.log.logId)}
            />
          ))
        ) : (
          <p className="analysis-empty-text">
            조건에 맞는 이상 로그가 없습니다.
          </p>
        )}
      </section>
    </AnimatedPanel>
  );
};

const SummaryMetric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const InboxRow = ({
  detail,
  onOpen,
}: {
  detail: MockAnomalyDetail;
  onOpen: () => void;
}) => {
  const severityTheme = categoryThemeMap[detail.log.severity];
  const SeverityIcon = severityTheme.icon;

  return (
    <button className="analysis-inbox-row" type="button" onClick={onOpen}>
      <span className={`analysis-inbox-row__icon ${severityTheme.className}`}>
        <SeverityIcon size={18} aria-hidden="true" />
      </span>
      <span className="analysis-inbox-row__body">
        <span className="analysis-inbox-row__meta">
          <Badge variant={severityToneMap[detail.log.severity]}>
            {severityTheme.label}
          </Badge>
          <Badge variant={statusToneMap[detail.log.status]}>
            {statusLabelMap[detail.log.status]}
          </Badge>
          <span>{detail.log.detectedAt.slice(5, 16)}</span>
        </span>
        <strong>{detail.log.processName}</strong>
        <span>{detail.log.summary}</span>
      </span>
      <span className="analysis-inbox-row__score">
        <span>Score</span>
        <strong>{detail.log.anomalyScore.toFixed(2)}</strong>
      </span>
    </button>
  );
};

const AnalysisDetailView = ({
  detail,
  theme,
  onBack,
  onCopyReport,
  onStatusChange,
}: {
  detail: MockAnomalyDetail;
  theme: CategoryTheme;
  onBack: () => void;
  onCopyReport: () => void;
  onStatusChange: (logId: string, nextStatus: AnalysisStatus) => void;
}) => (
  <AnimatedPanel className="analysis-detail-view">
    <div className="analysis-detail-breadcrumb">
      <div className="analysis-detail-breadcrumb__left">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <IconArrowLeft size={16} aria-hidden="true" />
          <span className="sr-only">목록으로 돌아가기</span>
        </Button>
        <span>상세 분석</span>
        <span>/</span>
        <strong>{detail.log.processName}</strong>
      </div>
      <div className="analysis-status-actions analysis-status-actions--inline">
        {detail.log.status === "Resolved" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(detail.log.logId, "Detected")}
          >
            <IconRefresh size={16} aria-hidden="true" />
            원래 상태로 복원
          </Button>
        ) : detail.log.status === "Open" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(detail.log.logId, "Detected")}
            >
              <IconRefresh size={16} aria-hidden="true" />
              원래 상태로 복원
            </Button>
            <Button
              size="sm"
              onClick={() => onStatusChange(detail.log.logId, "Resolved")}
            >
              <IconCircleCheck size={16} aria-hidden="true" />
              처리 완료
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(detail.log.logId, "Open")}
            >
              <IconFolderOpen size={16} aria-hidden="true" />
              처리 보류
            </Button>
            <Button
              size="sm"
              onClick={() => onStatusChange(detail.log.logId, "Resolved")}
            >
              <IconCircleCheck size={16} aria-hidden="true" />
              처리 완료
            </Button>
          </>
        )}
      </div>
    </div>

    <EventSummary detail={detail} theme={theme} />

    <div className="analysis-detail-grid">
      <ResponseCodeSection detail={detail} />
      <TransactionSection detail={detail} />
      <StatsSection detail={detail} />
    </div>

    <div className="analysis-detail-columns">
      <div className="analysis-detail-columns__main">
        <ProcessSection detail={detail} />
        <MessageSection detail={detail} />
        <FeatureSection detail={detail} />
      </div>
      <aside className="analysis-detail-columns__side">
        <DetailInfoSection detail={detail} />
        <LlmSection detail={detail} onCopyReport={onCopyReport} />
      </aside>
    </div>
  </AnimatedPanel>
);

const EventSummary = ({
  detail,
  theme,
}: {
  detail: MockAnomalyDetail;
  theme: CategoryTheme;
}) => {
  const SeverityIcon = theme.icon;

  return (
    <section className="analysis-summary-card">
      <div className="analysis-summary-card__content">
        <div className="analysis-summary-card__badges">
          <Badge variant={severityToneMap[detail.log.severity]}>
            {theme.label}
          </Badge>
          <Badge variant={statusToneMap[detail.log.status]}>
            {statusLabelMap[detail.log.status]}
          </Badge>
        </div>
        <h3>
          <span className={`analysis-heading-icon ${theme.className}`}>
            <SeverityIcon size={20} aria-hidden="true" />
          </span>
          {detail.log.summary}
        </h3>
        <p>{detail.log.transactionId}</p>
      </div>
      <div className="analysis-summary-card__metrics">
        <div className="analysis-score">
          <span>위험도 점수</span>
          <strong>{detail.log.anomalyScore.toFixed(2)}</strong>
          <div className="analysis-score__bar">
            <span
              style={{ width: `${Math.round(detail.log.anomalyScore * 100)}%` }}
            />
          </div>
        </div>
        <dl>
          <div>
            <dt>감지 시간</dt>
            <dd>{detail.log.detectedAt.slice(0, 16)}</dd>
          </div>
          <div>
            <dt>지속 시간</dt>
            <dd>{formatMs(detail.transaction.processTimeMs)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

const ResponseCodeSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconAlertTriangle size={18} aria-hidden="true" />}
      title="응답코드"
    />
    <div className="analysis-code-card">
      <strong>{detail.responseCodeDefinition.code}</strong>
      <div>
        <p>{detail.responseCodeDefinition.messageKo}</p>
        <span>{detail.responseCodeDefinition.enumName}</span>
      </div>
      <Badge
        variant={
          detail.responseCodeDefinition.severityHint === "critical"
            ? "critical"
            : "warning"
        }
      >
        {detail.responseCodeDefinition.displayGroup}
      </Badge>
    </div>
  </section>
);

const TransactionSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconDatabase size={18} aria-hidden="true" />}
      title="Transaction"
    />
    <dl className="analysis-kv-grid">
      <div>
        <dt>Interface</dt>
        <dd>{detail.transaction.interfaceId}</dd>
      </div>
      <div>
        <dt>Channel</dt>
        <dd>
          {detail.transaction.startChannelId} →{" "}
          {detail.transaction.endChannelId}
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

const StatsSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconChartBar size={18} aria-hidden="true" />}
      title="통계 요약"
    />
    <dl className="analysis-stat-grid">
      <div>
        <dt>Process</dt>
        <dd>{detail.processes.length}</dd>
      </div>
      <div>
        <dt>Message</dt>
        <dd>{detail.messages.length}</dd>
      </div>
      <div>
        <dt>Error</dt>
        <dd>
          {detail.processes.filter((process) => process.status === "F").length}
        </dd>
      </div>
    </dl>
  </section>
);

const ProcessSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card analysis-process-card">
    <div className="analysis-section-card__toolbar">
      <SectionTitle
        icon={<IconBinaryTree size={18} aria-hidden="true" />}
        title="Process Flow"
      />
      <div className="analysis-view-tools">
        <Button variant="ghost" size="sm">
          100%
        </Button>
        <Button variant="ghost" size="icon">
          <IconZoomOut size={16} aria-hidden="true" />
          <span className="sr-only">축소</span>
        </Button>
        <Button variant="ghost" size="icon">
          <IconZoomIn size={16} aria-hidden="true" />
          <span className="sr-only">확대</span>
        </Button>
        <Button variant="ghost" size="icon">
          <IconMaximize size={16} aria-hidden="true" />
          <span className="sr-only">전체 화면</span>
        </Button>
      </div>
    </div>
    <div className="analysis-process-list">
      {detail.processes.map((process) => (
        <article key={process.processId} className="analysis-process-item">
          <span
            className={`analysis-process-status analysis-process-status--${process.status.toLowerCase()}`}
          >
            {process.status}
          </span>
          <div>
            <strong>{process.processId}</strong>
            <p>
              {process.adapterType} / {process.channelId} / total{" "}
              {formatCount(process.totalCount)}
            </p>
            {process.responseMessage && (
              <small>{process.responseMessage}</small>
            )}
          </div>
        </article>
      ))}
    </div>
    <div className="analysis-process-legend">
      <span>
        <i className="analysis-dot analysis-dot--success" />
        성공
      </span>
      <span>
        <i className="analysis-dot analysis-dot--fail" />
        실패
      </span>
      <span>
        <i className="analysis-dot analysis-dot--warn" />
        경고
      </span>
      <span>
        <i className="analysis-dot analysis-dot--pending" />
        진행중
      </span>
    </div>
  </section>
);

const MessageSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconMessage2 size={18} aria-hidden="true" />}
      title="Messages"
    />
    <div className="analysis-message-table">
      <div className="analysis-message-table__head">
        <span>Direction</span>
        <span>Data</span>
        <span>Status</span>
        <span>Size</span>
      </div>
      {detail.messages.length > 0 ? (
        detail.messages.map((message) => (
          <div
            key={`${message.messageId}-${message.direction}`}
            className="analysis-message-row"
          >
            <span>{message.direction}</span>
            <span>{message.dataName || message.dataType}</span>
            <span>{message.status}</span>
            <span>{formatCount(message.dataSize)}</span>
          </div>
        ))
      ) : (
        <p className="analysis-empty-text">
          연결된 message snapshot이 없습니다.
        </p>
      )}
    </div>
    {detail.bodyPreviews.length > 0 && (
      <div className="analysis-body-preview">
        <strong>Body preview</strong>
        {detail.bodyPreviews.map((preview) => (
          <p key={preview.messageId}>
            {preview.recordCount} rows / {preview.fieldSummary.join(", ")} ·{" "}
            {preview.privacyNote}
          </p>
        ))}
      </div>
    )}
  </section>
);

const FeatureSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconCodeDots size={18} aria-hidden="true" />}
      title="Process Features"
    />
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

const DetailInfoSection = ({ detail }: { detail: MockAnomalyDetail }) => (
  <section className="analysis-section-card">
    <SectionTitle
      icon={<IconListDetails size={18} aria-hidden="true" />}
      title="상세 정보"
    />
    <dl className="analysis-detail-info-list">
      <div>
        <dt>이상 징후 ID</dt>
        <dd>{detail.log.logId}</dd>
      </div>
      <div>
        <dt>최초 감지</dt>
        <dd>{detail.transaction.startTime.slice(0, 16)}</dd>
      </div>
      <div>
        <dt>마지막 감지</dt>
        <dd>{detail.log.detectedAt.slice(0, 16)}</dd>
      </div>
      <div>
        <dt>환경</dt>
        <dd>운영</dd>
      </div>
      <div>
        <dt>감지 모델</dt>
        <dd>Isolation Forest</dd>
      </div>
      <div>
        <dt>임계값</dt>
        <dd>0.85</dd>
      </div>
    </dl>
  </section>
);

const LlmSection = ({
  detail,
  onCopyReport,
}: {
  detail: MockAnomalyDetail;
  onCopyReport: () => void;
}) => (
  <section className="analysis-section-card analysis-llm-card">
    <SectionTitle
      icon={<IconBrain size={18} aria-hidden="true" />}
      title="LLM Report"
    />
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

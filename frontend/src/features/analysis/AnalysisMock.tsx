import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBinaryTree,
  IconBrain,
  IconChartBar,
  IconChevronDown,
  IconCircleCheck,
  IconClipboard,
  IconClock,
  IconCodeDots,
  IconDatabase,
  IconFileAnalytics,
  IconFilter,
  IconFolderOpen,
  IconListDetails,
  IconMaximize,
  IconMessage2,
  IconRefresh,
  IconSearch,
  IconZoomIn,
  IconZoomOut,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import {
  SidebarNav,
  type SidebarNavGroup,
} from "../../components/layout/SidebarNav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { getStored, setStored, storageKeys } from "../../lib/storage";
import { mockAnomalyDetails } from "../../testing/mocks/mockAnalysis";
import { mockProcessFeatureDefinitions } from "../../testing/mocks/mockFeatureSchemas";
import type { MockAnomalyDetail } from "../../types/mock";
import { SchemaDialogContent } from "./components/SchemaDialogContent";
import { SectionTitle } from "./components/SectionTitle";
import {
  categoryOrder,
  categoryThemeMap,
  severityToneMap,
  statusLabelMap,
  statusToneMap,
} from "./constants";
import type {
  AnalysisCategory,
  AnalysisStatus,
  CategoryTheme,
  SortOption,
  StatusOverrides,
} from "./types";
import { getDetailByLogId, matchesCategory } from "./utils/detail";
import { getFeaturePreviewValue } from "./utils/featurePreview";
import { formatCount, formatMs } from "./utils/format";

export const AnalysisMock = () => {
  const [isWide, setIsWide] = useState<boolean>(() => {
    return getStored(storageKeys.layoutWide("analysis"), false);
  });

  const handleToggleWide = (val: boolean) => {
    setIsWide(val);
    setStored(storageKeys.layoutWide("analysis"), val);
  };

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
                isWide={isWide}
                onToggleWide={handleToggleWide}
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
                isWide={isWide}
                onToggleWide={handleToggleWide}
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
  isWide,
  onToggleWide,
}: {
  activeCategory: AnalysisCategory;
  categoryCounts: Record<AnalysisCategory, number>;
  details: MockAnomalyDetail[];
  query: string;
  onOpenDetail: (logId: string) => void;
  onQueryChange: (query: string) => void;
  isWide: boolean;
  onToggleWide: (val: boolean) => void;
}) => {
  const theme = categoryThemeMap[activeCategory];
  const Icon = theme.icon;
  const [sortMode, setSortMode] = useState<SortOption>(
    activeCategory === "All" ? "severity_desc" : "time_desc"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Set default sort mode when category changes
  useEffect(() => {
    setSortMode(activeCategory === "All" ? "severity_desc" : "time_desc");
    setCurrentPage(1);
  }, [activeCategory]);

  const sortedDetails = useMemo(() => {
    return [...details].sort((a, b) => {
      if (sortMode === "severity_desc" || sortMode === "severity_asc") {
        const severityRank: Record<string, number> = { Critical: 3, Warning: 2, Info: 1 };
        const rankA = severityRank[a.log.severity] || 0;
        const rankB = severityRank[b.log.severity] || 0;
        if (rankA !== rankB) {
          return sortMode === "severity_desc" ? rankB - rankA : rankA - rankB;
        }
        return new Date(b.log.detectedAt).getTime() - new Date(a.log.detectedAt).getTime();
      }
      if (sortMode === "time_asc") return new Date(a.log.detectedAt).getTime() - new Date(b.log.detectedAt).getTime();
      // time_desc
      return new Date(b.log.detectedAt).getTime() - new Date(a.log.detectedAt).getTime();
    });
  }, [details, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedDetails.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  
  const startIndex = (safePage - 1) * pageSize;
  const paginatedDetails = sortedDetails.slice(startIndex, startIndex + pageSize);

  return (
    <AnimatedPanel className={`analysis-inbox ${isWide ? "analysis-inbox--wide" : ""}`}>
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleWide(!isWide)}
            aria-label={isWide ? "콤팩트 화면으로 보기" : "넓은 화면으로 보기"}
          >
            {isWide ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
          </Button>

          <Modal
            isOpen={isSchemaOpen}
            onOpenChange={setIsSchemaOpen}
            size="xl"
            trigger={
              <Button variant="outline">
                <IconFileAnalytics size={16} aria-hidden="true" />
                스키마 보기
              </Button>
            }
            title="프로세스 기준 원본/피처 스키마"
            description="현재 AI 입력은 프로세스 단위 후보 피처를 우선 검토합니다."
          >
            <SchemaDialogContent />
          </Modal>
        </div>
      </header>

      <div className="analysis-search-row">
        <div className="analysis-search analysis-search--wide">
          <IconSearch size={16} aria-hidden="true" />
          <input
            value={query}
            placeholder="Process ID, Channel, 응답코드, Transaction context 검색"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className="analysis-chip-row">
          <Modal
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
            size="sm"
            trigger={
              <Button
                className="analysis-chip-button"
                size="sm"
                variant="outline"
              >
                <IconFilter size={16} aria-hidden="true" />
                검색 필터
                <IconChevronDown size={16} aria-hidden="true" />
              </Button>
            }
            title="검색 필터 설정"
            description="목록에 표시할 이상 로그의 조건을 설정합니다."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>위험도 (Severity)</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Critical</Button>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Warning</Button>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Info</Button>
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>상태 (Status)</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Open</Button>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Detected</Button>
                  <Button variant="outline" size="sm" className="analysis-chip-button">Resolved</Button>
                </div>
              </div>
            </div>
          </Modal>
          <div className="analysis-sort-group">
            <span className="analysis-sort-label">정렬</span>
            <CustomSortSelect 
              value={sortMode}
              onChange={(v) => {
                setSortMode(v);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
      <div className="analysis-simple-summary">
        <strong>검색결과 {details.length}건</strong>
        <span>최근 감지: 10분 전</span>
      </div>
      <section className="analysis-inbox-list" aria-label="이상 로그 목록">
        {paginatedDetails.length > 0 ? (
          paginatedDetails.map((detail) => (
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
      <footer className="analysis-inbox-footer">
        <div className="analysis-inbox-footer__left">
          <span className="analysis-inbox-footer__total">
            전체 {details.length}건
          </span>
        </div>
        <div className="analysis-pagination-controls">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <IconChevronLeft size={16} aria-hidden="true" />
          </Button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <Button
                key={pageNum}
                variant={safePage === pageNum ? "outline" : "ghost"}
                size="sm"
                className={safePage === pageNum ? "active" : ""}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <IconChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <div className="analysis-inbox-footer__right">
          <CustomPageSizeSelect 
            value={pageSize} 
            onChange={(v) => {
              setPageSize(v);
              setCurrentPage(1);
            }} 
          />
        </div>
      </footer>
    </AnimatedPanel>
  );
};

const CustomPageSizeSelect = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [10, 20, 50];

  return (
    <div className="custom-select-wrapper">
      <Button 
        variant="outline" 
        size="sm" 
        className="analysis-chip-button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        {value} / 페이지
        <IconChevronUp size={16} aria-hidden="true" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="custom-select-dropdown"
          >
            {options.map((opt) => (
              <button 
                key={opt} 
                className={`custom-select-option ${value === opt ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt} / 페이지
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomSortSelect = ({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { label: "위험도 높은순", value: "severity_desc" },
    { label: "위험도 낮은순", value: "severity_asc" },
    { label: "최신순", value: "time_desc" },
    { label: "과거순", value: "time_asc" }
  ] as const;

  const currentLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="custom-select-wrapper">
      <Button 
        variant="outline" 
        size="sm" 
        className="analysis-chip-button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        {currentLabel}
        <IconChevronDown size={16} aria-hidden="true" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="custom-select-dropdown--down"
            style={{ width: 140 }}
          >
            {options.map((opt) => (
              <button 
                key={opt.value} 
                className={`custom-select-option ${value === opt.value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



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
  isWide,
  onToggleWide,
}: {
  detail: MockAnomalyDetail;
  theme: CategoryTheme;
  onBack: () => void;
  onCopyReport: () => void;
  onStatusChange: (logId: string, nextStatus: AnalysisStatus) => void;
  isWide: boolean;
  onToggleWide: (val: boolean) => void;
}) => {
  const [activeNode, setActiveNode] = useState<{
    type: "focusProcess" | "contextProcess" | "transactionContext" | "message" | "body";
    id: string;
    label: string;
    data: any;
  } | null>(null);

  // 트리 접기/펼치기 상태 관리 (초기는 모두 펼침 상태)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const focusProcess = detail.processes.find((p) => p.processId === detail.log.processName) ?? detail.processes[0];
    const initialExpanded: Record<string, boolean> = {};
    detail.processes.forEach((p) => {
      initialExpanded[p.processId] = true;
    });
    detail.messages.forEach((m) => {
      initialExpanded[m.messageId] = true;
    });
    initialExpanded[`transaction-context:${detail.transaction.transactionId}`] = true;
    setExpandedNodes(initialExpanded);
    setActiveNode(
      focusProcess
        ? {
            type: "focusProcess",
            id: focusProcess.processId,
            label: `Focus Process: ${focusProcess.processId}`,
            data: focusProcess,
          }
        : null,
    );
  }, [detail]);

  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  return (
    <AnimatedPanel className={`analysis-detail-view ${isWide ? "analysis-detail-view--wide" : ""}`}>
      {/* 브레드크럼 및 상태 전환 버튼 */}
      <div className="analysis-detail-breadcrumb">
        <div className="analysis-detail-breadcrumb__left">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <IconArrowLeft size={16} aria-hidden="true" />
            <span className="sr-only">목록으로 돌아가기</span>
          </Button>
          <span>상세 분석</span>
          <span>/</span>
          <strong>Process: {detail.log.processName}</strong>
        </div>
        <div className="analysis-status-actions analysis-status-actions--inline">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onToggleWide(!isWide)}
            aria-label={isWide ? "콤팩트 화면으로 보기" : "넓은 화면으로 보기"}
          >
            {isWide ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
          </Button>

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

      {/* 1. 상단 기본 정보 패널 (full width 통합) */}
      <EventSummary detail={detail} theme={theme} />

      {/* 2. 하단 2열 레이아웃 */}
      <div className="analysis-detail-columns">
        {/* 하단 좌측: Process Flow 트리 패널 */}
        <div className="analysis-detail-columns__main">
          <section className="analysis-section-card" style={{ minHeight: "500px" }}>
            <div className="analysis-section-card__toolbar" style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <SectionTitle
                icon={<IconBinaryTree size={18} aria-hidden="true" />}
                title="Process Flow"
              />
              <span className="analysis-stats-compact" style={{ fontSize: "11px", color: "var(--mute)", fontWeight: 400 }}>
                (프로세스 {detail.processes.length}건 · 메시지 {detail.messages.length}건 · 에러 {detail.processes.filter((p) => p.status === "F").length}건)
              </span>
            </div>

            {/* 계층형 트리 렌더링 영역 */}
            <div className="tree-container">
              <ProcessFlowTree
                detail={detail}
                activeNode={activeNode}
                expandedNodes={expandedNodes}
                onSelectNode={setActiveNode}
                onToggleNode={toggleNode}
              />
            </div>

            {/* 선택 노드 원본 디테일 뷰 영역 */}
            <NodeDetailViewer activeNode={activeNode} detail={detail} />
          </section>
        </div>

        {/* 하단 우측: LLM 분석 및 메타데이터 */}
        <aside className="analysis-detail-columns__side">
          <LlmSection detail={detail} activeNode={activeNode} onCopyReport={onCopyReport} />
        </aside>
      </div>
    </AnimatedPanel>
  );
};

const EventSummary = ({
  detail,
  theme,
}: {
  detail: MockAnomalyDetail;
  theme: CategoryTheme;
}) => {
  const SeverityIcon = theme.icon;
  const scorePercent = Math.round(detail.log.anomalyScore * 100);
  const strokeColor =
    detail.log.severity === "Critical"
      ? "var(--error)"
      : detail.log.severity === "Warning"
        ? "var(--warning)"
        : "var(--link)";

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
          Process: {detail.log.processName}
        </h3>
      </div>
      <div className="analysis-summary-card__metrics">
        <div className="analysis-score-radial">
          <div className="analysis-score-radial__chart">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--canvas-soft-2)"
                strokeWidth="4.5"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={strokeColor}
                strokeWidth="5"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (scorePercent / 100) * 163.36}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ transition: "stroke-dashoffset 0.35s ease" }}
              />
            </svg>
            <div className="analysis-score-radial__value">
              <strong>{scorePercent}</strong>
            </div>
          </div>
          <div className="analysis-score-radial__label">
            <span>위험도 점수</span>
            <span>[0 - 100]</span>
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

const ProcessFlowTree = ({
  detail,
  activeNode,
  expandedNodes,
  onSelectNode,
  onToggleNode,
}: {
  detail: MockAnomalyDetail;
  activeNode: { id: string } | null;
  expandedNodes: Record<string, boolean>;
  onSelectNode: (node: any) => void;
  onToggleNode: (id: string, e: React.MouseEvent) => void;
}) => {
  const transactionId = detail.transaction.transactionId;
  const transactionContextId = `transaction-context:${transactionId}`;

  // 1. Transaction Node (Level 0 - 최상위)
  const renderTransactionNode = () => {
    const isSelected = activeNode?.id === transactionContextId;
    const isExpanded = !!expandedNodes[transactionContextId];
    const txStatusTone = detail.transaction.status === "S" ? "success" : detail.transaction.status === "F" ? "fail" : detail.transaction.status === "N" ? "pending" : "warn";
    const statusLabel = detail.transaction.status;

    // 최상위 프로세스들 (dependsOn === "NONE" 이거나 부모 프로세스가 detail.processes에 존재하지 않는 경우)
    const rootProcesses = detail.processes.filter(
      (p) => p.dependsOn === "NONE" || !detail.processes.some((parent) => parent.processId === p.dependsOn)
    );

    const hasChildren = rootProcesses.length > 0;

    return (
      <div className="tree-node-wrapper" key={transactionContextId}>
        <div
          className={`tree-node tree-node--level-0 ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--link)" } as React.CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "transactionContext",
              id: transactionContextId,
              label: `Transaction: ${transactionId}`,
              data: detail.transaction,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(transactionContextId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconDatabase size={16} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontWeight: 600 }}>Transaction: {transactionId.slice(0, 24)}...</span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${txStatusTone}`}>
              {statusLabel}
            </span>
            <span>{formatMs(detail.transaction.processTimeMs)}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {rootProcesses.map((p) => renderProcessNode(p, 1))}
          </div>
        )}
      </div>
    );
  };

  // 2. Process Node (Level 1 ~ N - 재귀적 자식 프로세스 처리)
  const renderProcessNode = (process: any, level: number) => {
    const processId = process.processId;
    const isExpanded = !!expandedNodes[processId];
    const isSelected = activeNode?.id === processId;
    const isTargetProcess = processId === detail.log.processName;
    const nodeKind = isTargetProcess ? "focusProcess" : "contextProcess";

    const pStatusTone = process.status === "S" ? "success" : process.status === "F" ? "fail" : process.status === "N" ? "pending" : "warn";

    // 자식 프로세스 찾기 (p.dependsOn === processId)
    const childProcesses = detail.processes.filter((p) => p.dependsOn === processId);
    // 이 프로세스에 속하는 메시지 찾기
    const processMessages = detail.messages.filter((m) => m.processId === processId);

    const hasChildren = childProcesses.length > 0 || processMessages.length > 0;

    return (
      <div className="tree-node-wrapper" key={processId}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""} ${isTargetProcess ? "tree-node--target-process" : ""}`}
          style={{ "--theme-color": isTargetProcess ? "var(--error)" : process.status === "F" ? "var(--error)" : "var(--body)" } as React.CSSProperties}
          onClick={() =>
            onSelectNode({
              type: nodeKind,
              id: processId,
              label: `${isTargetProcess ? "Focus Process" : "Context Process"}: ${processId}`,
              data: process,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(processId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconCodeDots size={15} style={{ color: process.status === "F" ? "var(--error)" : "var(--mute)" }} />
          <span className="tree-node-title" style={{ color: process.status === "F" ? "var(--error)" : "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            {isTargetProcess ? "Focus Process" : "Context Process"} : {processId}
            {isTargetProcess && (
              <span className="target-process-tag" style={{ background: "color-mix(in srgb, var(--error) 15%, transparent)", color: "var(--error)", fontSize: "9px", padding: "1px 4px", borderRadius: "3px", fontWeight: 600 }}>
                탐지 대상
              </span>
            )}
          </span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${pStatusTone}`}>
              {process.status}
            </span>
            <span>{process.adapterType}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {/* 자식 프로세스들 먼저 출력 */}
            {childProcesses.map((p) => renderProcessNode(p, level + 1))}
            {/* 메시지들 출력 */}
            {processMessages.map((m) => renderMessageNode(m, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 3. Message Node (Level N+1)
  const renderMessageNode = (message: any, level: number) => {
    const messageId = message.messageId;
    const isExpanded = !!expandedNodes[messageId];
    const isSelected = activeNode?.id === messageId;
    const mStatusTone = message.status === "S" ? "success" : message.status === "F" ? "fail" : message.status === "N" ? "pending" : "warn";

    const bodyPreviews = detail.bodyPreviews.filter((b) => b.messageId === messageId);
    const hasChildren = bodyPreviews.length > 0;

    return (
      <div className="tree-node-wrapper" key={messageId}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--mute)" } as React.CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "message",
              id: messageId,
              label: `Message: ${messageId.slice(0, 8)}...`,
              data: message,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(messageId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconMessage2 size={14} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontSize: "12px", color: "var(--body)" }}>
            Msg: {message.dataName || message.dataType} ({message.direction})
          </span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${mStatusTone}`} style={{ fontSize: "9px", minWidth: 16, height: 16 }}>
              {message.status}
            </span>
            <span>Size: {formatCount(message.dataSize)}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {bodyPreviews.map((b) => renderBodyPreviewNode(b, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 4. Body Preview Node (Level N+2)
  const renderBodyPreviewNode = (bodyPreview: any, level: number) => {
    const id = `${bodyPreview.messageId}-body`;
    const isSelected = activeNode?.id === id;

    return (
      <div className="tree-node-wrapper" key={id}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--mute)" } as React.CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "body",
              id,
              label: `Body Summary`,
              data: bodyPreview,
            })
          }
        >
          <span style={{ width: 20 }} />
          <IconListDetails size={13} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontSize: "11px", fontWeight: 400, color: "var(--mute)" }}>
            [Body Summary] {bodyPreview.recordCount} rows, privacy fields masked
          </span>
          <span className="tree-node-meta" style={{ fontSize: "10px" }}>
            <span>Masked</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {renderTransactionNode()}
    </div>
  );
};

const NodeDetailViewer = ({
  activeNode,
  detail,
}: {
  activeNode: {
    type: "focusProcess" | "contextProcess" | "transactionContext" | "message" | "body";
    id: string;
    label: string;
    data: any;
  } | null;
  detail: MockAnomalyDetail;
}) => {
  if (!activeNode) {
    return (
      <div className="node-detail-panel">
        <div className="node-detail-empty">
          <IconListDetails size={32} style={{ color: "var(--mute)", opacity: 0.6 }} />
          <div>
            <strong>상세 정보 비활성화</strong>
            <p style={{ margin: "4px 0 0", color: "var(--mute)", fontSize: "12px" }}>
              위 Process Flow 트리에서 탐색하고자 하는 노드(탐지 프로세스, 주변 프로세스, 메시지 등)를 클릭하시면,<br />
              해당 단계의 상세 원본 필드 정보가 여기에 노출됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { type, label, data } = activeNode;

  return (
    <div className="node-detail-panel">
      <div className="node-detail-title-group">
        <h4>
          <IconListDetails size={16} />
          {label} 원본 정보
        </h4>
        <span style={{ fontSize: "11px", color: "var(--mute)" }}>Type: {type.toUpperCase()}</span>
      </div>

      <div className="node-detail-table-wrapper">
        <table className="node-detail-table">
          <tbody>
            {type === "transactionContext" && (
              <>
                <tr>
                  <th>TRANSACTION_ID</th>
                  <td>{data.transactionId}</td>
                </tr>
                <tr>
                  <th>INTERFACE_ID (Type)</th>
                  <td>{data.interfaceId} ({data.interfaceType})</td>
                </tr>
                <tr>
                  <th>CATEGORY_NAME</th>
                  <td>{data.categoryName}</td>
                </tr>
                <tr>
                  <th>PROCESS_HUB_ID</th>
                  <td>{data.processHubId}</td>
                </tr>
                <tr>
                  <th>CHANNELS</th>
                  <td>{data.startChannelId} → {data.endChannelId}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DURATION_TIME</th>
                  <td>{data.startTime} ~ {data.endTime} ({formatMs(data.processTimeMs)})</td>
                </tr>
                <tr>
                  <th>RETRY_COUNT</th>
                  <td>{data.retryCount} 회</td>
                </tr>
              </>
            )}

            {(type === "focusProcess" || type === "contextProcess") && (
              <>
                <tr>
                  <th>PROCESS_ID</th>
                  <td>{data.processId}</td>
                </tr>
                <tr>
                  <th>DEPENDS_ON</th>
                  <td>{data.dependsOn}</td>
                </tr>
                <tr>
                  <th>ADAPTER_TYPE</th>
                  <td>{data.adapterType}</td>
                </tr>
                <tr>
                  <th>CHANNEL_ID</th>
                  <td>{data.channelId}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DURATION_TIME</th>
                  <td>{data.startTime} ~ {data.endTime || "진행중"}</td>
                </tr>
                <tr>
                  <th>TOTAL_RECORD_COUNT</th>
                  <td>{formatCount(data.totalCount)} 건</td>
                </tr>
                <tr>
                  <th>RETRY_COUNT</th>
                  <td>{data.retryCount} 회</td>
                </tr>
                {/* 기존 FeatureSection 결합하여 표시 */}
                <tr>
                  <th>PROCESS_FEATURES</th>
                  <td style={{ padding: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, padding: 8, background: "var(--canvas-soft)" }}>
                      {mockProcessFeatureDefinitions.slice(0, 4).map((feature) => (
                        <div key={feature.featureName} style={{ border: "1px solid var(--hairline)", borderRadius: 4, padding: "4px 8px", background: "var(--canvas)" }}>
                          <span style={{ fontSize: "9px", color: "var(--mute)", textTransform: "uppercase" }}>{feature.stage}</span>
                          <strong style={{ display: "block", fontSize: "11px", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{feature.featureName}</strong>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--body)" }}>{getFeaturePreviewValue(detail, feature.featureName)}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </>
            )}

            {type === "message" && (
              <>
                <tr>
                  <th>MESSAGE_ID</th>
                  <td>{data.messageId}</td>
                </tr>
                <tr>
                  <th>PROCESS_ID</th>
                  <td>{data.processId}</td>
                </tr>
                <tr>
                  <th>DIRECTION (DataType)</th>
                  <td>{data.direction} ({data.dataType})</td>
                </tr>
                <tr>
                  <th>DATA_NAME</th>
                  <td>{data.dataName || "-"}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DATA_SIZE</th>
                  <td>{formatCount(data.dataSize)} bytes</td>
                </tr>
                <tr>
                  <th>PROCESSED_TIME</th>
                  <td>{data.processedAt}</td>
                </tr>
              </>
            )}

            {type === "body" && (
              <>
                <tr>
                  <th>MESSAGE_ID</th>
                  <td>{data.messageId}</td>
                </tr>
                <tr>
                  <th>SOURCE</th>
                  <td>{data.source}</td>
                </tr>
                <tr>
                  <th>RECORD_COUNT</th>
                  <td>{data.recordCount} 건</td>
                </tr>
                <tr>
                  <th>FIELD_SUMMARY (PREVIEW)</th>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {data.fieldSummary.map((f: string) => (
                        <Badge key={f} variant="default" style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}>
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>PRIVACY_NOTE</th>
                  <td style={{ color: "var(--mute)", fontSize: "11px", fontStyle: "italic", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                    <IconAlertTriangle size={12} style={{ color: "var(--warn)", flexShrink: 0 }} /> {data.privacyNote}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LlmSection = ({
  detail,
  activeNode,
  onCopyReport,
}: {
  detail: MockAnomalyDetail;
  activeNode: { type: string; label: string; data: any } | null;
  onCopyReport: () => void;
}) => {
  // 선택 노드에 따른 AI 연동 힌트
  const activeNodeHint = useMemo(() => {
    if (!activeNode) return null;
    const { type, label, data } = activeNode;

    if ((type === "focusProcess" || type === "contextProcess") && data.status === "F") {
      return `이 프로세스(${data.processId})는 ${data.adapterType} 어댑터 처리 중 에러(코드:${data.responseCode || "없음"})가 발생했습니다. 현재 탐지 기준은 process 단위이므로 이 노드의 원본값과 파생 피처를 우선 확인해야 합니다.`;
    }
    if (type === "transactionContext" && data.status === "F") {
      return `이 transaction은 선택 프로세스의 주변 흐름을 이해하기 위한 context입니다. 이상 판단의 기준은 transaction 전체가 아니라 focus process입니다.`;
    }
    if (type === "body") {
      return `민감 데이터(개인정보, 결제/금융 정보)가 메시지 본문에 포함되어 있어, 보안 필터링 및 컬럼 마스킹 처리가 완료되었습니다. 현 UI에서는 메타데이터 정보만 노출됩니다.`;
    }
    return `선택한 ${label} 노드는 focus process 분석에 도움을 주는 주변 근거 노드입니다.`;
  }, [activeNode]);

  return (
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
          <p style={{ fontWeight: 500 }}>{detail.llmReport.summary}</p>
          <dl className="analysis-llm-list" style={{ marginTop: "12px" }}>
            <div>
              <dt>원인 후보</dt>
              <dd>{detail.llmReport.suspectedCause}</dd>
            </div>
            <div>
              <dt>권장 조치</dt>
              <dd>{detail.llmReport.recommendedAction}</dd>
            </div>
          </dl>
          
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Button variant="outline" size="sm" onClick={onCopyReport} className="analysis-chip-button">
              <IconClipboard size={16} aria-hidden="true" />
              리포트 복사
            </Button>
          </div>
        </>
      )}

      {/* 실시간 노드 AI 연동 근거 힌트 */}
      {activeNodeHint && (
        <div style={{
          marginTop: "16px",
          padding: "10px",
          borderRadius: "var(--radius-md)",
          background: "var(--theme-soft, #edf4ff)",
          border: "1px solid color-mix(in srgb, var(--theme-color, var(--link)) 30%, var(--hairline))",
          fontSize: "12px",
          color: "var(--ink)",
          lineHeight: "17px"
        }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IconBrain size={14} style={{ color: "var(--link)" }} />
            AI 인터랙티브 힌트
          </strong>
          <p style={{ margin: "4px 0 0", color: "var(--body)" }}>{activeNodeHint}</p>
        </div>
      )}

      {/* 하단 메타데이터/상세정보 통합 영역 */}
      <div className="analysis-llm-meta">
        <h4 style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconListDetails size={14} style={{ color: "var(--mute)" }} />
          Anomaly Metadata
        </h4>
        <dl className="analysis-detail-info-list" style={{ gap: "6px" }}>
          <div>
            <dt>이상 징후 ID</dt>
            <dd style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{detail.log.logId}</dd>
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
            <dt>감지 모델</dt>
            <dd>Isolation Forest (임계: 0.85)</dd>
          </div>
          <div>
            <dt>감지 환경</dt>
            <dd>운영 (PRD)</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

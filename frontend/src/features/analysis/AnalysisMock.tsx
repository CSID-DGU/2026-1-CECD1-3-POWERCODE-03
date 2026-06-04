import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  SidebarNav,
  type SidebarNavGroup,
} from "../../components/layout/SidebarNav";
import { TooltipProvider } from "../../components/ui/tooltip";
import { useAnomalyDetails } from "../../hooks/useAnomalyDetails";
import { useFeatureSchema } from "../../hooks/useFeatureSchema";
import { getStored, setStored, storageKeys } from "../../lib/storage";
import { AnalysisDetailView } from "./components/AnalysisDetailView";
import { AnalysisInboxView } from "./components/AnalysisInboxView";
import {
  categoryOrder,
  categoryThemeMap,
} from "./constants";
import type {
  AnalysisCategory,
  AnalysisStatus,
  StatusOverrides,
  TypingPhase,
} from "./types";
import { getDetailByLogId, matchesCategory } from "./utils/detail";

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
  const { details: anomalyDetails } = useAnomalyDetails();
  const { featureDefinitions, rawFieldDefinitions } = useFeatureSchema();

  // LLM 분석 시뮬레이션 상태 변수들
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [dynamicReports, setDynamicReports] = useState<
    Record<
      string,
      { summary: string; suspectedCause: string; recommendedAction: string }
    >
  >({});
  const [typingLogId, setTypingLogId] = useState<string | null>(null);
  const [typingPhase, setTypingPhase] = useState<TypingPhase>("summary");

  const handleRequestLLMAnalysis = (logId: string) => {
    setAnalyzingLogId(logId);
    setAnalyzingStep(0);

    const stepInterval = setInterval(() => {
      setAnalyzingStep((prev) => prev + 1);
    }, 850);

    setTimeout(() => {
      clearInterval(stepInterval);
      setAnalyzingLogId(null);

      if (logId === "TEST_DB2DB_100") {
        setDynamicReports((prev) => ({
          ...prev,
          [logId]: {
            summary: "대량의 데이터 적재 중 발생한 트랜잭션 락 타임아웃 오류입니다.",
            suspectedCause: "IF_DB2DB_100_PR003(WRITER)에서 데이터 처리(50,000건) 도중 락 자원 대기로 270초 이상 장시간의 타임아웃(ORA-02049)이 발생했습니다.",
            recommendedAction: "대상 테이블의 락 경합 상태를 모니터링하고, DB 적재 배치 사이즈(Batch Size)를 작게 쪼개어 동시성 트랜잭션 부하를 경감하도록 권장합니다.",
          },
        }));
        setTypingLogId(logId);
        setTypingPhase("summary");
      } else {
        setDynamicReports((prev) => ({
          ...prev,
          [logId]: {
            summary: "AI가 로그 컨텍스트를 분석하여 원인 파악을 즉석에서 완료했습니다.",
            suspectedCause: "대상 프로세스의 지연 지표가 탐지 임계값을 초과했습니다.",
            recommendedAction: "동일 응답코드의 리소스 병목 유무를 점검하고 모니터링을 유지하십시오.",
          },
        }));
        setTypingLogId(logId);
        setTypingPhase("summary");
      }
      toast.success("AI 분석 요약 리포트가 성공적으로 생성되었습니다.");
    }, 2500);
  };

  const detailsWithStatus = useMemo(() => {
    return anomalyDetails.map((detail) => {
      const dynReport = dynamicReports[detail.log.logId];
      return {
        ...detail,
        log: {
          ...detail.log,
          status: statusOverrides[detail.log.logId] ?? detail.log.status,
        },
        llmReport: dynReport
          ? {
              ...detail.llmReport,
              status: "success" as const,
              summary: dynReport.summary,
              suspectedCause: dynReport.suspectedCause,
              recommendedAction: dynReport.recommendedAction,
            }
          : detail.llmReport,
      };
    });
  }, [anomalyDetails, statusOverrides, dynamicReports]);

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
                featureDefinitions={featureDefinitions}
                theme={activeTheme}
                onBack={() => setActiveDetailId(null)}
                onCopyReport={handleCopyReport}
                onStatusChange={handleStatusChange}
                isWide={isWide}
                onToggleWide={handleToggleWide}
                analyzingLogId={analyzingLogId}
                analyzingStep={analyzingStep}
                typingLogId={typingLogId}
                typingPhase={typingPhase}
                setTypingPhase={setTypingPhase}
                handleRequestLLMAnalysis={handleRequestLLMAnalysis}
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

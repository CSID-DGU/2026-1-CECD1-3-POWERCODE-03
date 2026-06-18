import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  type SidebarNavGroup,
} from "../../../components/layout/SidebarNav";
import { useAnomalyDetails } from "../../../hooks/useAnomalyDetails";
import { useFeatureSchema } from "../../../hooks/useFeatureSchema";
import { getStored, setStored, storageKeys } from "../../../lib/storage";
import type { MockAnomalyDetail } from "../../../types/mock";
import { categoryOrder, categoryThemeMap } from "../constants";
import type {
  AnalysisCategory,
  AnalysisStatus,
  StatusOverrides,
} from "../types";
import { getDetailByLogId, matchesCategory } from "../utils/detail";

const applyDynamicReports = (
  details: MockAnomalyDetail[],
  statusOverrides: StatusOverrides,
  dynamicReports: Record<string, {
    recommendedAction: string;
    summary: string;
    suspectedCause: string;
  }>,
) => {
  return details.map((detail) => {
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
};

const getCategoryCounts = (details: MockAnomalyDetail[]) => {
  return details.reduce<Record<AnalysisCategory, number>>(
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
};

const filterDetails = (
  details: MockAnomalyDetail[],
  activeCategory: AnalysisCategory,
  query: string,
) => {
  return details.filter((detail) => {
    const searchable = `${detail.log.summary} ${detail.log.processName} ${detail.log.channelName} ${detail.log.transactionId} ${detail.log.responseCode}`;
    const matchesQuery = searchable
      .toLowerCase()
      .includes(query.trim().toLowerCase());

    return matchesCategory(detail, activeCategory) && matchesQuery;
  });
};

const getSidebarGroups = (
  categoryCounts: Record<AnalysisCategory, number>,
): SidebarNavGroup<AnalysisCategory>[] => {
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
};

export const useAnalysisWorkspace = (
  dynamicReports: Record<string, {
    recommendedAction: string;
    summary: string;
    suspectedCause: string;
  }>,
) => {
  const [isWide, setIsWide] = useState<boolean>(() => {
    return getStored(storageKeys.layoutWide("analysis"), false);
  });
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory>("All");
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<StatusOverrides>({});
  const { details: anomalyDetails } = useAnomalyDetails();
  const { featureDefinitions, rawFieldDefinitions } = useFeatureSchema();

  const handleToggleWide = (val: boolean) => {
    setIsWide(val);
    setStored(storageKeys.layoutWide("analysis"), val);
  };

  const detailsWithStatus = useMemo(() => {
    return applyDynamicReports(anomalyDetails, statusOverrides, dynamicReports);
  }, [anomalyDetails, statusOverrides, dynamicReports]);

  const categoryCounts = useMemo(() => {
    return getCategoryCounts(detailsWithStatus);
  }, [detailsWithStatus]);

  const filteredDetails = useMemo(() => {
    return filterDetails(detailsWithStatus, activeCategory, query);
  }, [activeCategory, detailsWithStatus, query]);

  const activeDetail = getDetailByLogId(detailsWithStatus, activeDetailId);
  const activeTheme = activeDetail
    ? categoryThemeMap[activeDetail.log.severity]
    : categoryThemeMap[activeCategory];
  const sidebarGroups = useMemo(() => {
    return getSidebarGroups(categoryCounts);
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

  return {
    activeCategory,
    activeDetail,
    activeTheme,
    categoryCounts,
    featureDefinitions,
    filteredDetails,
    handleCategoryChange,
    handleCopyReport,
    handleStatusChange,
    handleToggleWide,
    isWide,
    query,
    rawFieldDefinitions,
    setActiveDetailId,
    setQuery,
    sidebarGroups,
  };
};

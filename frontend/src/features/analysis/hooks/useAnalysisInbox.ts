import { useEffect, useMemo, useState } from "react";
import type { MockAnomalyDetail } from "../../../types/mock";
import type { AnalysisCategory, SortOption } from "../types";

const severityRank: Record<string, number> = {
  Critical: 3,
  Warning: 2,
  Info: 1,
};

const getDefaultSortMode = (category: AnalysisCategory): SortOption =>
  category === "All" ? "severity_desc" : "time_desc";

export const useAnalysisInbox = (
  activeCategory: AnalysisCategory,
  details: MockAnomalyDetail[],
) => {
  const [sortMode, setSortMode] = useState<SortOption>(
    getDefaultSortMode(activeCategory),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSortMode(getDefaultSortMode(activeCategory));
    setCurrentPage(1);
  }, [activeCategory]);

  const sortedDetails = useMemo(() => {
    return [...details].sort((a, b) => {
      if (sortMode === "severity_desc" || sortMode === "severity_asc") {
        const rankA = severityRank[a.log.severity] || 0;
        const rankB = severityRank[b.log.severity] || 0;
        if (rankA !== rankB) {
          return sortMode === "severity_desc" ? rankB - rankA : rankA - rankB;
        }
        return (
          new Date(b.log.detectedAt).getTime() -
          new Date(a.log.detectedAt).getTime()
        );
      }

      const timeDiff =
        new Date(a.log.detectedAt).getTime() -
        new Date(b.log.detectedAt).getTime();

      return sortMode === "time_asc" ? timeDiff : -timeDiff;
    });
  }, [details, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedDetails.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedDetails = sortedDetails.slice(startIndex, startIndex + pageSize);

  const handleSortModeChange = (nextSortMode: SortOption) => {
    setSortMode(nextSortMode);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  return {
    goToNextPage,
    goToPreviousPage,
    handlePageSizeChange,
    handleSortModeChange,
    isFilterOpen,
    pageSize,
    paginatedDetails,
    safePage,
    setCurrentPage,
    setIsFilterOpen,
    sortMode,
    totalPages,
  };
};

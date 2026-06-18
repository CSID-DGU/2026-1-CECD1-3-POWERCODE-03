import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatedPanel } from "../../../components/layout/AnimatedPanel";
import { Button } from "../../../components/ui/button";
import type { MockAnomalyDetail } from "../../../types/mock";
import { CustomPageSizeSelect, CustomSortSelect } from "./AnalysisSelects";
import { categoryThemeMap } from "../constants";
import { useAnalysisInbox } from "../hooks/useAnalysisInbox";
import type { AnalysisCategory } from "../types";
import { AnalysisFilterDialog } from "./AnalysisFilterDialog";
import { AnalysisInboxRow } from "./AnalysisInboxRow";

export const AnalysisInboxView = ({
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
  const {
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
  } = useAnalysisInbox(activeCategory, details);

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
        </div>
      </header>

      <div className="analysis-search-row">
        <div className="analysis-search analysis-search--wide">
          <IconSearch size={16} aria-hidden="true" />
          <input
            value={query}
            placeholder="Transaction ID, Process ID, Channel, 응답코드 검색"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className="analysis-chip-row">
          <AnalysisFilterDialog
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          />
          <div className="analysis-sort-group">
            <span className="analysis-sort-label">정렬</span>
            <CustomSortSelect 
              value={sortMode}
              onChange={handleSortModeChange}
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
            <AnalysisInboxRow
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
            onClick={goToPreviousPage}
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
            onClick={goToNextPage}
          >
            <IconChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <div className="analysis-inbox-footer__right">
          <CustomPageSizeSelect 
            value={pageSize} 
            onChange={handlePageSizeChange} 
          />
        </div>
      </footer>
    </AnimatedPanel>
  );
};

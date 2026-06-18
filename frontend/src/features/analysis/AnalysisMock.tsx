import { AnimatePresence } from "motion/react";
import { SidebarNav } from "../../components/layout/SidebarNav";
import { TooltipProvider } from "../../components/ui/tooltip";
import { AnalysisDetailView } from "./components/AnalysisDetailView";
import { AnalysisInboxView } from "./components/AnalysisInboxView";
import { useAnalysisWorkspace } from "./hooks/useAnalysisWorkspace";
import { useLlmAnalysisSimulation } from "./hooks/useLlmAnalysisSimulation";

export const AnalysisMock = () => {
  const {
    analyzingLogId,
    analyzingStep,
    dynamicReports,
    handleRequestLLMAnalysis,
    setTypingPhase,
    typingLogId,
    typingPhase,
  } = useLlmAnalysisSimulation();
  const {
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
    setActiveDetailId,
    setQuery,
    sidebarGroups,
  } = useAnalysisWorkspace(dynamicReports);

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

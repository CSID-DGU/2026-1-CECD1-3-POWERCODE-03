import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBinaryTree,
  IconCircleCheck,
  IconFolderOpen,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState, type MouseEvent } from "react";
import { AnimatedPanel } from "../../../components/layout/AnimatedPanel";
import { Button } from "../../../components/ui/button";
import type { ProcessFeatureDefinition } from "../../../types/domain";
import type { MockAnomalyDetail } from "../../../types/mock";
import { categoryThemeMap } from "../constants";
import type { AnalysisNode, AnalysisStatus, CategoryTheme, TypingPhase } from "../types";
import { SectionTitle } from "./SectionTitle";
import { EventSummary } from "./EventSummary";
import { LlmSection } from "./LlmSection";
import { NodeDetailViewer } from "./NodeDetailViewer";
import { ProcessFlowTree } from "./ProcessFlowTree";

export const AnalysisDetailView = ({
  detail,
  featureDefinitions,
  theme,
  onBack,
  onCopyReport,
  onStatusChange,
  isWide,
  onToggleWide,
  analyzingLogId,
  analyzingStep,
  typingLogId,
  typingPhase,
  setTypingPhase,
  handleRequestLLMAnalysis,
}: {
  detail: MockAnomalyDetail;
  featureDefinitions: ProcessFeatureDefinition[];
  theme: CategoryTheme;
  onBack: () => void;
  onCopyReport: () => void;
  onStatusChange: (logId: string, nextStatus: AnalysisStatus) => void;
  isWide: boolean;
  onToggleWide: (val: boolean) => void;
  analyzingLogId: string | null;
  analyzingStep: number;
  typingLogId: string | null;
  typingPhase: TypingPhase;
  setTypingPhase: (phase: TypingPhase) => void;
  handleRequestLLMAnalysis: (logId: string) => void;
}) => {
  const [activeNode, setActiveNode] = useState<AnalysisNode | null>(null);

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

  const toggleNode = (nodeId: string, e: MouseEvent) => {
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
          <strong>{detail.log.transactionId}</strong>
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
          <section className="analysis-section-card analysis-process-flow-card">
            <div className="analysis-section-card__toolbar analysis-section-card__toolbar--compact">
              <SectionTitle
                icon={<IconBinaryTree size={18} aria-hidden="true" />}
                title="Process Flow"
              />
              <span className="analysis-stats-compact">
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
            <NodeDetailViewer
              activeNode={activeNode}
              detail={detail}
              featureDefinitions={featureDefinitions}
            />
          </section>
        </div>

        {/* 하단 우측: LLM 분석 및 메타데이터 */}
        <aside className="analysis-detail-columns__side">
          <LlmSection
            detail={detail}
            activeNode={activeNode}
            onCopyReport={onCopyReport}
            analyzingLogId={analyzingLogId}
            analyzingStep={analyzingStep}
            typingLogId={typingLogId}
            typingPhase={typingPhase}
            setTypingPhase={setTypingPhase}
            handleRequestLLMAnalysis={handleRequestLLMAnalysis}
          />
        </aside>
      </div>
    </AnimatedPanel>
  );
};

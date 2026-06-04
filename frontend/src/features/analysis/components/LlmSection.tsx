import { IconBrain, IconClipboard, IconListDetails } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "../../../components/ui/button";
import type { MockAnomalyDetail } from "../../../types/mock";
import type { AnalysisNode, TypingPhase } from "../types";
import { SectionTitle } from "./SectionTitle";
import { TypewriterText } from "./TypewriterText";

export const LlmSection = ({
  detail,
  activeNode,
  onCopyReport,
  analyzingLogId,
  analyzingStep,
  typingLogId,
  typingPhase,
  setTypingPhase,
  handleRequestLLMAnalysis,
}: {
  detail: MockAnomalyDetail;
  activeNode: AnalysisNode | null;
  onCopyReport: () => void;
  analyzingLogId: string | null;
  analyzingStep: number;
  typingLogId: string | null;
  typingPhase: TypingPhase;
  setTypingPhase: (phase: TypingPhase) => void;
  handleRequestLLMAnalysis: (logId: string) => void;
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
      
      {analyzingLogId === detail.log.logId ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 10px", gap: "12px" }}>
          {/* Stark 톤의 미니멀 로딩 스피너 */}
          <div style={{
            width: "28px",
            height: "28px",
            border: "2px solid var(--hairline-strong)",
            borderTop: "2px solid var(--link)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontSize: "12px", color: "var(--mute)", textAlign: "center", minHeight: "18px", margin: 0 }}>
            {analyzingStep === 0 && "AI 추론 서버가 트랜잭션 의존성 트리를 파싱하고 있습니다..."}
            {analyzingStep === 1 && "ORA-02049 락 경합 및 타임아웃 컨텍스트 수집 중..."}
            {analyzingStep >= 2 && "근본 원인 리포트 템플릿 생성 완료 및 텍스트 렌더링 준비..."}
          </p>
        </div>
      ) : typingLogId === detail.log.logId && typingPhase !== "done" ? (
        <>
          <p style={{ fontWeight: 500, minHeight: "20px" }}>
            {typingPhase === "summary" ? (
              <TypewriterText
                text={detail.llmReport.summary}
                onComplete={() => setTypingPhase("cause")}
              />
            ) : (
              detail.llmReport.summary
            )}
          </p>
          <dl className="analysis-llm-list" style={{ marginTop: "12px" }}>
            {(typingPhase === "cause" || typingPhase === "action") && (
              <div>
                <dt>원인 후보</dt>
                <dd style={{ minHeight: "20px" }}>
                  {typingPhase === "cause" ? (
                    <TypewriterText
                      text={detail.llmReport.suspectedCause}
                      onComplete={() => setTypingPhase("action")}
                    />
                  ) : (
                    detail.llmReport.suspectedCause
                  )}
                </dd>
              </div>
            )}
            {typingPhase === "action" && (
              <div>
                <dt>권장 조치</dt>
                <dd style={{ minHeight: "20px" }}>
                  {typingPhase === "action" ? (
                    <TypewriterText
                      text={detail.llmReport.recommendedAction}
                      onComplete={() => setTypingPhase("done")}
                    />
                  ) : (
                    detail.llmReport.recommendedAction
                  )}
                </dd>
              </div>
            )}
          </dl>
        </>
      ) : detail.llmReport.status === "idle" ? (
        <div className="analysis-llm-empty">
          <p>아직 LLM 분석을 요청하지 않은 이벤트입니다.</p>
          <Button size="sm" onClick={() => handleRequestLLMAnalysis(detail.log.logId)}>
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

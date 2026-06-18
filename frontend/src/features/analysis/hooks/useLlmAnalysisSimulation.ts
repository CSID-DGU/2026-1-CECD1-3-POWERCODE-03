import { useState } from "react";
import toast from "react-hot-toast";
import type { TypingPhase } from "../types";

type DynamicLlmReport = {
  summary: string;
  suspectedCause: string;
  recommendedAction: string;
};

const createDynamicReport = (logId: string): DynamicLlmReport => {
  if (logId === "TEST_DB2DB_100") {
    return {
      summary: "대량의 데이터 적재 중 발생한 트랜잭션 락 타임아웃 오류입니다.",
      suspectedCause: "IF_DB2DB_100_PR003(WRITER)에서 데이터 처리(50,000건) 도중 락 자원 대기로 270초 이상 장시간의 타임아웃(ORA-02049)이 발생했습니다.",
      recommendedAction: "대상 테이블의 락 경합 상태를 모니터링하고, DB 적재 배치 사이즈(Batch Size)를 작게 쪼개어 동시성 트랜잭션 부하를 경감하도록 권장합니다.",
    };
  }

  return {
    summary: "AI가 로그 컨텍스트를 분석하여 원인 파악을 즉석에서 완료했습니다.",
    suspectedCause: "대상 프로세스의 지연 지표가 탐지 임계값을 초과했습니다.",
    recommendedAction: "동일 응답코드의 리소스 병목 유무를 점검하고 모니터링을 유지하십시오.",
  };
};

export const useLlmAnalysisSimulation = () => {
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [dynamicReports, setDynamicReports] = useState<Record<string, DynamicLlmReport>>({});
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
      setDynamicReports((prev) => ({
        ...prev,
        [logId]: createDynamicReport(logId),
      }));
      setTypingLogId(logId);
      setTypingPhase("summary");
      toast.success("AI 분석 요약 리포트가 성공적으로 생성되었습니다.");
    }, 2500);
  };

  return {
    analyzingLogId,
    analyzingStep,
    dynamicReports,
    handleRequestLLMAnalysis,
    setTypingPhase,
    typingLogId,
    typingPhase,
  };
};

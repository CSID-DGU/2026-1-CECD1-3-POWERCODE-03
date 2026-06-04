export interface RawLogData {
  logId?: string;
  anomalyScore: number;
  processTimeMs: number;
  responseCode: string;
}

export interface ProcessedLogResult {
  logId?: string;
  riskScore: number;
  riskLevel: 1 | 2 | 3;
  severity: "Info" | "Warning" | "Critical";
}

/**
 * 이상 탐지 점수와 트랜잭션 컨텍스트를 받아 0-100 사이의 위험도 점수를 산출합니다.
 */
export function calculate_single_risk_score(
  anomalyScore: number,
  processTimeMs: number,
  responseCode: string
): number {
  // 1. 모델 이상 탐지 점수 가중치 (60%): anomalyScore(0.0~1.0) -> max 60점
  const modelScore = anomalyScore * 60;

  // 2. 응답 코드 치명도 가중치 (25%): 성공(0000)인 경우 0점, 시스템 오류 코드(4xxx)인 경우 25점, 기타 에러 15점
  let codeScore = 0;
  if (responseCode && responseCode !== "0000") {
    codeScore = responseCode.startsWith("4") ? 25 : 15;
  }

  // 3. 처리 속도(지연 시간) 가중치 (15%): 지연 시간이 5분(300,000ms) 이상이면 만점(15점), 그 외 비례 계산
  const maxDelayThreshold = 300000;
  const delayScore = Math.min((processTimeMs / maxDelayThreshold) * 15, 15);

  // 최종 점수를 반올림하여 0 ~ 100 사이로 보정
  const totalScore = modelScore + codeScore + delayScore;
  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

/**
 * 정규화된 위험 점수를 바탕으로 위험 등급(1, 2, 3)과 Severity를 분류합니다.
 */
export function classify_risk_level(riskScore: number): {
  riskLevel: 1 | 2 | 3;
  severity: "Info" | "Warning" | "Critical";
} {
  if (riskScore >= 70) {
    return { riskLevel: 3, severity: "Critical" };
  } else if (riskScore >= 40) {
    return { riskLevel: 2, severity: "Warning" };
  } else {
    return { riskLevel: 1, severity: "Info" };
  }
}

/**
 * 로그 데이터 목록을 받아서 위험 점수와 등급을 일괄 계산하여 반환합니다.
 */
export function process_log_batch(logs: RawLogData[]): ProcessedLogResult[] {
  return logs.map((log) => {
    const riskScore = calculate_single_risk_score(
      log.anomalyScore,
      log.processTimeMs,
      log.responseCode
    );
    const { riskLevel, severity } = classify_risk_level(riskScore);

    return {
      logId: log.logId,
      riskScore,
      riskLevel,
      severity,
    };
  });
}

import { Request, Response } from "express";
import {
  process_log_batch,
  RawLogData,
  calculate_single_risk_score,
  classify_risk_level,
} from "../services/anomalyService.js";

// SSE connection pool
const streamClients = new Set<Response>();

/**
 * 전송된 로그 데이터의 위험 등급과 점수를 평가하여 산출하는 컨트롤러 함수입니다.
 */
export function evaluate_logs(req: Request, res: Response): void {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs)) {
      res.status(400).json({
        message: "Invalid input: 'logs' must be an array of raw log objects.",
      });
      return;
    }

    // 필수 필드 유효성 검사
    const invalidLog = logs.find(
      (log: any) =>
        typeof log.anomalyScore !== "number" ||
        typeof log.processTimeMs !== "number" ||
        typeof log.responseCode !== "string"
    );

    if (invalidLog) {
      res.status(400).json({
        message:
          "Invalid log data format. Each log must contain anomalyScore (number), processTimeMs (number), and responseCode (string).",
      });
      return;
    }

    const processedLogs = process_log_batch(logs as RawLogData[]);

    res.status(200).json({
      message: "Successfully evaluated anomaly risk levels.",
      results: processedLogs,
    });
  } catch (error: any) {
    console.error("Error evaluating logs:", error);
    res.status(500).json({
      message: "An error occurred while evaluating log anomaly risk levels.",
      error: error.message,
    });
  }
}

/**
 * SSE(Server-Sent Events) 클라이언트를 등록하여 실시간 스트림 연결을 엽니다.
 */
export function register_stream_client(req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  streamClients.add(res);
  console.log(`[SSE] Client connected. Total clients: ${streamClients.size}`);

  req.on("close", () => {
    streamClients.delete(res);
    console.log(`[SSE] Client disconnected. Total clients: ${streamClients.size}`);
  });
}

/**
 * 외부(sender.py 등)로부터 단일 로그를 전송받아 정규화 및 분석 후 SSE를 통해 전체 클라이언트에 실시간 브로드캐스트합니다.
 */
export function receive_realtime_log(req: Request, res: Response): void {
  try {
    const rawLog = req.body;

    if (
      typeof rawLog.anomalyScore !== "number" ||
      typeof rawLog.processTimeMs !== "number" ||
      typeof rawLog.responseCode !== "string"
    ) {
      res.status(400).json({
        message: "Invalid log format. Must contain anomalyScore, processTimeMs, and responseCode.",
      });
      return;
    }

    // 1. Calculate risk score & classify level
    const riskScore = calculate_single_risk_score(
      rawLog.anomalyScore,
      rawLog.processTimeMs,
      rawLog.responseCode
    );
    const { riskLevel, severity } = classify_risk_level(riskScore);

    // 2. Enrich log structure
    const enrichedLog = {
      logId: rawLog.logId || `log-${Math.random().toString(36).substring(2, 11)}`,
      detectedAt: rawLog.detectedAt || new Date().toISOString(),
      severity,
      status: rawLog.status || "Detected",
      originalSeverity: rawLog.originalSeverity || severity,
      processName: rawLog.processName || "UNKNOWN_PROCESS",
      channelName: rawLog.channelName || "UNKNOWN_CHANNEL",
      transactionId: rawLog.transactionId || `tr-${Math.random().toString(36).substring(2, 11)}`,
      responseCode: rawLog.responseCode,
      anomalyScore: rawLog.anomalyScore,
      riskScore,
      riskLevel,
      summary: rawLog.summary || "Real-time log incoming via sender.py",
      transaction: {
        transactionId: rawLog.transactionId || `tr-${Math.random().toString(36).substring(2, 11)}`,
        processTimeMs: rawLog.processTimeMs,
        status: rawLog.responseCode === "0000" ? "SUCCESS" : "FAIL",
      },
      llmReport: {
        summary: rawLog.summary || "Real-time anomalous process activity detected.",
        suspectedCause: rawLog.suspectedCause || "Anomalous score or error response code.",
        recommendedAction: rawLog.recommendedAction || "Investigate the system log context.",
      }
    };

    // 3. Broadcast to all SSE clients
    const dataString = JSON.stringify(enrichedLog);
    for (const client of streamClients) {
      client.write(`data: ${dataString}\n\n`);
    }

    res.status(201).json({
      message: "Real-time log received and streamed.",
      log: enrichedLog,
    });
  } catch (error: any) {
    console.error("Error receiving real-time log:", error);
    res.status(500).json({
      message: "Failed to process real-time log.",
      error: error.message,
    });
  }
}

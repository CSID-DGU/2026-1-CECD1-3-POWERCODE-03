import {
  IconChevronRight,
  IconCodeDots,
  IconDatabase,
  IconListDetails,
  IconMessage2,
} from "@tabler/icons-react";
import type { CSSProperties, MouseEvent } from "react";
import type { MockAnomalyDetail } from "../../../types/mock";
import type { AnalysisNode } from "../types";
import { formatCount, formatMs } from "../utils/format";

export const ProcessFlowTree = ({
  detail,
  activeNode,
  expandedNodes,
  onSelectNode,
  onToggleNode,
}: {
  detail: MockAnomalyDetail;
  activeNode: { id: string } | null;
  expandedNodes: Record<string, boolean>;
  onSelectNode: (node: AnalysisNode) => void;
  onToggleNode: (id: string, e: MouseEvent) => void;
}) => {
  const transactionId = detail.transaction.transactionId;
  const transactionContextId = `transaction-context:${transactionId}`;

  // 1. Transaction Node (Level 0 - 최상위)
  const renderTransactionNode = () => {
    const isSelected = activeNode?.id === transactionContextId;
    const isExpanded = !!expandedNodes[transactionContextId];
    const txStatusTone = detail.transaction.status === "S" ? "success" : detail.transaction.status === "F" ? "fail" : detail.transaction.status === "N" ? "pending" : "warn";
    const statusLabel = detail.transaction.status;

    // 최상위 프로세스들 (dependsOn === "NONE" 이거나 부모 프로세스가 detail.processes에 존재하지 않는 경우)
    const rootProcesses = detail.processes.filter(
      (p) => p.dependsOn === "NONE" || !detail.processes.some((parent) => parent.processId === p.dependsOn)
    );

    const hasChildren = rootProcesses.length > 0;

    return (
      <div className="tree-node-wrapper" key={transactionContextId}>
        <div
          className={`tree-node tree-node--level-0 ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--link)" } as CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "transactionContext",
              id: transactionContextId,
              label: `Transaction: ${transactionId}`,
              data: detail.transaction,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(transactionContextId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconDatabase size={16} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontWeight: 600 }}>Transaction: {transactionId.slice(0, 24)}...</span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${txStatusTone}`}>
              {statusLabel}
            </span>
            <span>{formatMs(detail.transaction.processTimeMs)}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {rootProcesses.map((p) => renderProcessNode(p, 1))}
          </div>
        )}
      </div>
    );
  };

  // 2. Process Node (Level 1 ~ N - 재귀적 자식 프로세스 처리)
  const renderProcessNode = (process: MockAnomalyDetail["processes"][number], level: number) => {
    const processId = process.processId;
    const isExpanded = !!expandedNodes[processId];
    const isSelected = activeNode?.id === processId;
    const isTargetProcess = processId === detail.log.processName;
    const nodeKind = isTargetProcess ? "focusProcess" : "contextProcess";

    const pStatusTone = process.status === "S" ? "success" : process.status === "F" ? "fail" : process.status === "N" ? "pending" : "warn";

    // 자식 프로세스 찾기 (p.dependsOn === processId)
    const childProcesses = detail.processes.filter((p) => p.dependsOn === processId);
    // 이 프로세스에 속하는 메시지 찾기
    const processMessages = detail.messages.filter((m) => m.processId === processId);

    const hasChildren = childProcesses.length > 0 || processMessages.length > 0;

    return (
      <div className="tree-node-wrapper" key={processId}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""} ${isTargetProcess ? "tree-node--target-process" : ""}`}
          style={{ "--theme-color": isTargetProcess ? "var(--error)" : process.status === "F" ? "var(--error)" : "var(--body)" } as CSSProperties}
          onClick={() =>
            onSelectNode({
              type: nodeKind,
              id: processId,
              label: `${isTargetProcess ? "Focus Process" : "Context Process"}: ${processId}`,
              data: process,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(processId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconCodeDots size={15} style={{ color: process.status === "F" ? "var(--error)" : "var(--mute)" }} />
          <span className="tree-node-title" style={{ color: process.status === "F" ? "var(--error)" : "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            {isTargetProcess ? "Focus Process" : "Context Process"} : {processId}
            {isTargetProcess && (
              <span className="target-process-tag" style={{ background: "color-mix(in srgb, var(--error) 15%, transparent)", color: "var(--error)", fontSize: "9px", padding: "1px 4px", borderRadius: "3px", fontWeight: 600 }}>
                탐지 대상
              </span>
            )}
          </span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${pStatusTone}`}>
              {process.status}
            </span>
            <span>{process.adapterType}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {/* 자식 프로세스들 먼저 출력 */}
            {childProcesses.map((p) => renderProcessNode(p, level + 1))}
            {/* 메시지들 출력 */}
            {processMessages.map((m) => renderMessageNode(m, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 3. Message Node (Level N+1)
  const renderMessageNode = (message: MockAnomalyDetail["messages"][number], level: number) => {
    const messageId = message.messageId;
    const isExpanded = !!expandedNodes[messageId];
    const isSelected = activeNode?.id === messageId;
    const mStatusTone = message.status === "S" ? "success" : message.status === "F" ? "fail" : message.status === "N" ? "pending" : "warn";

    const bodyPreviews = detail.bodyPreviews.filter((b) => b.messageId === messageId);
    const hasChildren = bodyPreviews.length > 0;

    return (
      <div className="tree-node-wrapper" key={messageId}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--mute)" } as CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "message",
              id: messageId,
              label: `Message: ${messageId.slice(0, 8)}...`,
              data: message,
            })
          }
        >
          {hasChildren ? (
            <button
              className="tree-node-toggle-btn"
              onClick={(e) => onToggleNode(messageId, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <IconChevronRight
                size={14}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <IconMessage2 size={14} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontSize: "12px", color: "var(--body)" }}>
            Msg: {message.dataName || message.dataType} ({message.direction})
          </span>
          <span className="tree-node-meta">
            <span className={`tree-node-status-badge status--${mStatusTone}`} style={{ fontSize: "9px", minWidth: 16, height: 16 }}>
              {message.status}
            </span>
            <span>Size: {formatCount(message.dataSize)}</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {bodyPreviews.map((b) => renderBodyPreviewNode(b, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 4. Body Preview Node (Level N+2)
  const renderBodyPreviewNode = (bodyPreview: MockAnomalyDetail["bodyPreviews"][number], level: number) => {
    const id = `${bodyPreview.messageId}-body`;
    const isSelected = activeNode?.id === id;

    return (
      <div className="tree-node-wrapper" key={id}>
        <div
          className={`tree-node tree-node--level-${level} ${isSelected ? "tree-node--selected" : ""}`}
          style={{ "--theme-color": "var(--mute)" } as CSSProperties}
          onClick={() =>
            onSelectNode({
              type: "body",
              id,
              label: `Body Summary`,
              data: bodyPreview,
            })
          }
        >
          <span style={{ width: 20 }} />
          <IconListDetails size={13} style={{ color: "var(--mute)" }} />
          <span className="tree-node-title" style={{ fontSize: "11px", fontWeight: 400, color: "var(--mute)" }}>
            [Body Summary] {bodyPreview.recordCount} rows, privacy fields masked
          </span>
          <span className="tree-node-meta" style={{ fontSize: "10px" }}>
            <span>Masked</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {renderTransactionNode()}
    </div>
  );
};


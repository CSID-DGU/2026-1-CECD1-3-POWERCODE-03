import { IconAlertTriangle, IconListDetails } from "@tabler/icons-react";
import { Badge } from "../../../components/ui/badge";
import type { ProcessFeatureDefinition } from "../../../types/domain";
import type { MockAnomalyDetail } from "../../../types/mock";
import type { AnalysisNode } from "../types";
import { getFeaturePreviewValue } from "../utils/featurePreview";
import { formatCount, formatMs } from "../utils/format";

export const NodeDetailViewer = ({
  activeNode,
  detail,
  featureDefinitions,
}: {
  activeNode: AnalysisNode | null;
  detail: MockAnomalyDetail;
  featureDefinitions: ProcessFeatureDefinition[];
}) => {
  if (!activeNode) {
    return (
      <div className="node-detail-panel">
        <div className="node-detail-empty">
          <IconListDetails size={32} style={{ color: "var(--mute)", opacity: 0.6 }} />
          <div>
            <strong>상세 정보 비활성화</strong>
            <p style={{ margin: "4px 0 0", color: "var(--mute)", fontSize: "12px" }}>
              위 Process Flow 트리에서 탐색하고자 하는 노드(탐지 프로세스, 주변 프로세스, 메시지 등)를 클릭하시면,<br />
              해당 단계의 상세 원본 필드 정보가 여기에 노출됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { type, label, data } = activeNode;

  return (
    <div className="node-detail-panel">
      <div className="node-detail-title-group">
        <h4>
          <IconListDetails size={16} />
          {label} 원본 정보
        </h4>
        <span style={{ fontSize: "11px", color: "var(--mute)" }}>Type: {type.toUpperCase()}</span>
      </div>

      <div className="node-detail-table-wrapper">
        <table className="node-detail-table">
          <tbody>
            {type === "transactionContext" && (
              <>
                <tr>
                  <th>TRANSACTION_ID</th>
                  <td>{data.transactionId}</td>
                </tr>
                <tr>
                  <th>INTERFACE_ID (Type)</th>
                  <td>{data.interfaceId} ({data.interfaceType})</td>
                </tr>
                <tr>
                  <th>CATEGORY_NAME</th>
                  <td>{data.categoryName}</td>
                </tr>
                <tr>
                  <th>PROCESS_HUB_ID</th>
                  <td>{data.processHubId}</td>
                </tr>
                <tr>
                  <th>CHANNELS</th>
                  <td>{data.startChannelId} → {data.endChannelId}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DURATION_TIME</th>
                  <td>{data.startTime} ~ {data.endTime} ({formatMs(data.processTimeMs)})</td>
                </tr>
                <tr>
                  <th>RETRY_COUNT</th>
                  <td>{data.retryCount} 회</td>
                </tr>
              </>
            )}

            {(type === "focusProcess" || type === "contextProcess") && (
              <>
                <tr>
                  <th>PROCESS_ID</th>
                  <td>{data.processId}</td>
                </tr>
                <tr>
                  <th>DEPENDS_ON</th>
                  <td>{data.dependsOn}</td>
                </tr>
                <tr>
                  <th>ADAPTER_TYPE</th>
                  <td>{data.adapterType}</td>
                </tr>
                <tr>
                  <th>CHANNEL_ID</th>
                  <td>{data.channelId}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DURATION_TIME</th>
                  <td>{data.startTime} ~ {data.endTime || "진행중"}</td>
                </tr>
                <tr>
                  <th>TOTAL_RECORD_COUNT</th>
                  <td>{formatCount(data.totalCount)} 건</td>
                </tr>
                <tr>
                  <th>RETRY_COUNT</th>
                  <td>{data.retryCount} 회</td>
                </tr>
                {/* 기존 FeatureSection 결합하여 표시 */}
                <tr>
                  <th>PROCESS_FEATURES</th>
                  <td style={{ padding: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, padding: 8, background: "var(--canvas-soft)" }}>
                      {featureDefinitions.slice(0, 4).map((feature) => (
                        <div key={feature.featureName} style={{ border: "1px solid var(--hairline)", borderRadius: 4, padding: "4px 8px", background: "var(--canvas)" }}>
                          <span style={{ fontSize: "9px", color: "var(--mute)", textTransform: "uppercase" }}>{feature.stage}</span>
                          <strong style={{ display: "block", fontSize: "11px", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{feature.featureName}</strong>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--body)" }}>{getFeaturePreviewValue(detail, feature.featureName)}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </>
            )}

            {type === "message" && (
              <>
                <tr>
                  <th>MESSAGE_ID</th>
                  <td>{data.messageId}</td>
                </tr>
                <tr>
                  <th>PROCESS_ID</th>
                  <td>{data.processId}</td>
                </tr>
                <tr>
                  <th>DIRECTION (DataType)</th>
                  <td>{data.direction} ({data.dataType})</td>
                </tr>
                <tr>
                  <th>DATA_NAME</th>
                  <td>{data.dataName || "-"}</td>
                </tr>
                <tr>
                  <th>STATUS (Response)</th>
                  <td>
                    <Badge variant={data.status === "S" ? "success" : "critical"}>{data.status}</Badge>
                    {data.responseCode && <span style={{ marginLeft: 8 }}>Code: {data.responseCode}</span>}
                  </td>
                </tr>
                <tr>
                  <th>RESPONSE_MESSAGE</th>
                  <td style={{ color: "var(--error)", fontFamily: "inherit" }}>{data.responseMessage || "-"}</td>
                </tr>
                <tr>
                  <th>DATA_SIZE</th>
                  <td>{formatCount(data.dataSize)} bytes</td>
                </tr>
                <tr>
                  <th>PROCESSED_TIME</th>
                  <td>{data.processedAt}</td>
                </tr>
              </>
            )}

            {type === "body" && (
              <>
                <tr>
                  <th>MESSAGE_ID</th>
                  <td>{data.messageId}</td>
                </tr>
                <tr>
                  <th>SOURCE</th>
                  <td>{data.source}</td>
                </tr>
                <tr>
                  <th>RECORD_COUNT</th>
                  <td>{data.recordCount} 건</td>
                </tr>
                <tr>
                  <th>FIELD_SUMMARY (PREVIEW)</th>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {data.fieldSummary.map((f: string) => (
                        <Badge key={f} variant="default" style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}>
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>PRIVACY_NOTE</th>
                  <td style={{ color: "var(--mute)", fontSize: "11px", fontStyle: "italic", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                    <IconAlertTriangle size={12} style={{ color: "var(--warn)", flexShrink: 0 }} /> {data.privacyNote}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


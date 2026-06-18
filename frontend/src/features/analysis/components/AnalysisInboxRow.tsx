import { Badge } from "../../../components/ui/badge";
import type { MockAnomalyDetail } from "../../../types/mock";
import { categoryThemeMap, severityToneMap, statusLabelMap, statusToneMap } from "../constants";

export const AnalysisInboxRow = ({
  detail,
  onOpen,
}: {
  detail: MockAnomalyDetail;
  onOpen: () => void;
}) => {
  const severityTheme = categoryThemeMap[detail.log.severity];
  const SeverityIcon = severityTheme.icon;

  return (
    <button className="analysis-inbox-row" type="button" onClick={onOpen}>
      <span className={`analysis-inbox-row__icon ${severityTheme.className}`}>
        <SeverityIcon size={18} aria-hidden="true" />
      </span>
      <span className="analysis-inbox-row__body">
        <span className="analysis-inbox-row__meta">
          <Badge variant={severityToneMap[detail.log.severity]}>
            {severityTheme.label}
          </Badge>
          <Badge variant={statusToneMap[detail.log.status]}>
            {statusLabelMap[detail.log.status]}
          </Badge>
          <span>{detail.log.detectedAt.slice(5, 16)}</span>
        </span>
        <strong>{detail.log.transactionId}</strong>
        <span>Focus process: {detail.log.processName}</span>
        <span>{detail.log.summary}</span>
      </span>
      <span className="analysis-inbox-row__score">
        <span>Score</span>
        <strong>{detail.log.anomalyScore.toFixed(2)}</strong>
      </span>
    </button>
  );
};

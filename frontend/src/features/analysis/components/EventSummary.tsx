import { Badge } from "../../../components/ui/badge";
import type { MockAnomalyDetail } from "../../../types/mock";
import { severityToneMap, statusLabelMap, statusToneMap } from "../constants";
import type { CategoryTheme } from "../types";
import { formatMs } from "../utils/format";
import { getSeverityColor } from "../utils/severity";

export const EventSummary = ({
  detail,
  theme,
}: {
  detail: MockAnomalyDetail;
  theme: CategoryTheme;
}) => {
  const SeverityIcon = theme.icon;
  const scorePercent = Math.round(detail.log.anomalyScore * 100);

  return (
    <section className="analysis-summary-card">
      <div className="analysis-summary-card__content">
        <div className="analysis-summary-card__badges">
          <Badge variant={severityToneMap[detail.log.severity]}>
            {theme.label}
          </Badge>
          <Badge variant={statusToneMap[detail.log.status]}>
            {statusLabelMap[detail.log.status]}
          </Badge>
        </div>
        <h3>
          <span className={`analysis-heading-icon ${theme.className}`}>
            <SeverityIcon size={20} aria-hidden="true" />
          </span>
          {detail.log.transactionId}
        </h3>
        <p className="analysis-summary-card__focus">
          Focus process: {detail.log.processName}
        </p>
      </div>
      <div className="analysis-summary-card__metrics">
        <div className="analysis-score-radial">
          <div className="analysis-score-radial__chart">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--canvas-soft-2)"
                strokeWidth="4.5"
              />
              <circle
                className="analysis-score-radial__progress"
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={getSeverityColor(detail.log.severity)}
                strokeWidth="5"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (scorePercent / 100) * 163.36}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div className="analysis-score-radial__value">
              <strong>{scorePercent}</strong>
            </div>
          </div>
          <div className="analysis-score-radial__label">
            <span>위험도 점수</span>
            <span>[0 - 100]</span>
          </div>
        </div>
        <dl>
          <div>
            <dt>감지 시간</dt>
            <dd>{detail.log.detectedAt.slice(0, 16)}</dd>
          </div>
          <div>
            <dt>지속 시간</dt>
            <dd>{formatMs(detail.transaction.processTimeMs)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

import type { WidgetStatus } from "../../types/mock";

type StatusDotProps = {
  status: WidgetStatus;
};

export const StatusDot = ({ status }: StatusDotProps) => <span className={`status-dot status-dot--${status}`} />;

import type { MockWidget } from "../../../types/mock";
import { renderMiniatureChart } from "./HomeWidgetContent";

type WidgetPreviewSurfaceProps = {
  widget: MockWidget;
  fallbackLabel: string;
};

export const WidgetPreviewSurface = ({
  widget,
  fallbackLabel,
}: WidgetPreviewSurfaceProps) => {
  const miniature = renderMiniatureChart(widget.widgetId);

  if (miniature) {
    return (
      <div style={{ position: "absolute", inset: 0, padding: "8px", pointerEvents: "none" }}>
        {miniature}
      </div>
    );
  }

  return (
    <div style={{ padding: "8px var(--space-sm)", textAlign: "center", display: "grid", placeItems: "center", height: "100%", width: "100%", boxSizing: "border-box" }}>
      <div>
        <span>{widget.value}</span>
        <p style={{ margin: 0 }}>{fallbackLabel}</p>
      </div>
    </div>
  );
};

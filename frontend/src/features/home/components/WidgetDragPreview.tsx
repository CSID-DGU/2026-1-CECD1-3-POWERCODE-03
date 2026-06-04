import { motion } from "motion/react";
import type { MockWidget } from "../../../types/mock";
import { WidgetPreviewSurface } from "./WidgetPreviewSurface";

type WidgetDragPreviewProps = {
  widget: MockWidget;
  x: number;
  y: number;
};

export const WidgetDragPreview = ({ widget, x, y }: WidgetDragPreviewProps) => (
  <motion.div
    animate={{ opacity: 1, scale: 1 }}
    className={`widget-drag-preview widget-drag-preview--${widget.size}`}
    exit={{ opacity: 0, scale: 0.96 }}
    initial={{ opacity: 0, scale: 0.96 }}
    style={{ left: x, top: y }}
  >
    <WidgetPreviewSurface widget={widget} fallbackLabel={widget.title} />
  </motion.div>
);

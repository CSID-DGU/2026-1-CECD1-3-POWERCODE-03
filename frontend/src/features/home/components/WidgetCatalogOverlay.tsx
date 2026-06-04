import {
  IconGridDots,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Modal } from "../../../components/ui/Modal";
import { StatusDot } from "../../../components/ui/StatusDot";
import type { MockWidget } from "../../../types/mock";
import { WidgetPreviewSurface } from "./WidgetPreviewSurface";

type WidgetCatalogOverlayProps = {
  isOpen: boolean;
  widgets: MockWidget[];
  onOpenChange: (isOpen: boolean) => void;
  onAddWidget: (widget: MockWidget) => void;
  onWidgetPointerDown: (
    widget: MockWidget,
    event: ReactPointerEvent<HTMLElement>,
  ) => void;
};

export const WidgetCatalogOverlay = ({
  isOpen,
  widgets,
  onOpenChange,
  onAddWidget,
  onWidgetPointerDown,
}: WidgetCatalogOverlayProps) => (
  <Modal
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    size="xl"
    title="위젯 추가"
    description="드래그앤드롭으로 화면에 배치하거나, 추가 버튼을 클릭해 대시보드에 위젯을 추가합니다."
  >
    <div className="widget-catalog-container">
      <div className="widget-catalog__sidebar">
        <div className="widget-catalog__search">
          <IconSearch size={18} aria-hidden="true" />
          <span>위젯 검색</span>
        </div>
        <button
          className="widget-catalog__category widget-catalog__category--active"
          type="button"
        >
          <IconGridDots size={20} aria-hidden="true" />
          모든 위젯
        </button>
        <button className="widget-catalog__category" type="button">
          <StatusDot status="warning" />
          이상 탐지
        </button>
        <button className="widget-catalog__category" type="button">
          <StatusDot status="normal" />
          운영 상태
        </button>
      </div>

      <div className="widget-catalog__content">
        <div className="widget-catalog__grid">
          {widgets.map((widget) => (
            <article
              key={widget.widgetId}
              className={`widget-preview widget-preview--${widget.size}`}
            >
              <div className="widget-preview__surface-container">
                <div className="widget-preview__surface">
                  <div
                    className="widget-preview__drag-source"
                    onPointerDown={(event) => onWidgetPointerDown(widget, event)}
                    style={{ position: "relative", width: "100%", height: "100%" }}
                  >
                    <WidgetPreviewSurface widget={widget} fallbackLabel={widget.meta ?? ""} />
                  </div>
                </div>
              </div>
              <strong>{widget.title}</strong>
              <p>{widget.description}</p>
              <button type="button" onClick={() => onAddWidget(widget)}>
                <IconPlus size={16} aria-hidden="true" />
                추가
              </button>
            </article>
          ))}
          {widgets.length === 0 && (
            <div className="widget-catalog__empty">추가 가능한 위젯이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  </Modal>
);

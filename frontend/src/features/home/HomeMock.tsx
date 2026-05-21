import {
  IconCheck,
  IconGridDots,
  IconGripVertical,
  IconLayoutGridAdd,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import ReactGridLayout, {
  type Layout,
  type LayoutItem,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import { useEffect, useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import toast from "react-hot-toast";
import { StatusDot } from "../../components/ui/StatusDot";
import { Modal } from "../../components/ui/Modal";
import { allWidgets, homeWidgetItems } from "../../testing/mocks/mockWidgets";
import type { UserRole } from "../../types/app";
import type { MockWidget } from "../../types/mock";
import {
  createLayoutItem,
  createWidgetLayout,
  getNextLayoutPosition,
  widgetGridColumns,
  widgetSizeMap,
} from "./utils/widgetLayout";

type HomeMockProps = {
  role: UserRole;
};

type DragPreview = {
  widget: MockWidget;
  x: number;
  y: number;
};

type WidgetGhost = {
  id: string;
  title: string;
  value: string;
  meta?: string;
  status: MockWidget["status"];
  description: string;
  supportingItems: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};


export const HomeMock = ({ role }: HomeMockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [ghost, setGhost] = useState<WidgetGhost | null>(null);
  const baseWidgets = useMemo(
    () =>
      allWidgets.filter(
        (widget) => widget.role === "all" || widget.role === role,
      ),
    [role],
  );
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(() =>
    baseWidgets.map((widget) => widget.widgetId),
  );
  const visibleWidgets = useMemo(
    () =>
      homeWidgetItems.filter(
        (widget) =>
          activeWidgetIds.includes(widget.widgetId) &&
          (widget.role === "all" || widget.role === role),
      ),
    [activeWidgetIds, role],
  );
  const availableWidgets = useMemo(
    () =>
      homeWidgetItems.filter(
        (widget) =>
          !activeWidgetIds.includes(widget.widgetId) &&
          (widget.role === "all" || widget.role === role),
      ),
    [activeWidgetIds, role],
  );
  const initialLayout = useMemo(
    () => createWidgetLayout(visibleWidgets),
    [visibleWidgets],
  );
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1216,
  });

  useEffect(() => {
    const nextBaseWidgets = allWidgets.filter(
      (widget) => widget.role === "all" || widget.role === role,
    );
    setActiveWidgetIds(nextBaseWidgets.map((widget) => widget.widgetId));
    setIsEditing(false);
    setIsCatalogOpen(false);
  }, [role]);

  useEffect(() => {
    setLayout((currentLayout) => {
      const currentById = new Map(currentLayout.map((item) => [item.i, item]));
      let nextLayout = visibleWidgets
        .filter((widget) => currentById.has(widget.widgetId))
        .map((widget) => currentById.get(widget.widgetId)!);

      visibleWidgets
        .filter((widget) => !currentById.has(widget.widgetId))
        .forEach((widget) => {
          const position = getNextLayoutPosition(nextLayout, widget);
          nextLayout = [
            ...nextLayout,
            createLayoutItem(widget, position.x, position.y),
          ];
        });

      return nextLayout.length > 0 ? nextLayout : initialLayout;
    });
  }, [initialLayout, visibleWidgets]);

  useEffect(() => {
    if (!dragPreview) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setDragPreview((current) =>
        current ? { ...current, x: event.clientX, y: event.clientY } : null,
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      const frameRect = containerRef.current?.getBoundingClientRect();
      const draggedWidget = dragPreview.widget;

      if (
        frameRect &&
        event.clientX >= frameRect.left &&
        event.clientX <= frameRect.right &&
        event.clientY >= frameRect.top &&
        event.clientY <= frameRect.bottom
      ) {
        const size = widgetSizeMap[draggedWidget.size];
        const columnWidth = frameRect.width / widgetGridColumns;
        const x = Math.max(
          0,
          Math.min(
            widgetGridColumns - size.w,
            Math.floor((event.clientX - frameRect.left) / columnWidth),
          ),
        );
        const y = Math.max(
          0,
          Math.floor((event.clientY - frameRect.top) / (226 + 16)),
        );

        addWidgetToGrid(draggedWidget, { x, y });
      }

      setDragPreview(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [containerRef, dragPreview]);

  const handleEditToggle = () => {
    if (isEditing) {
      toast.success("홈 위젯 배치를 반영했습니다.");
      setIsCatalogOpen(false);
    }

    setIsEditing((current) => !current);
  };

  const addWidgetToGrid = (
    widget: MockWidget,
    position?: Pick<LayoutItem, "x" | "y">,
  ) => {
    setLayout((currentLayout) => {
      const fallbackPosition = getNextLayoutPosition(currentLayout, widget);
      const nextPosition = position ?? fallbackPosition;

      return [
        ...currentLayout,
        createLayoutItem(widget, nextPosition.x, nextPosition.y),
      ];
    });
    setActiveWidgetIds((currentIds) =>
      currentIds.includes(widget.widgetId)
        ? currentIds
        : [...currentIds, widget.widgetId],
    );
    setIsCatalogOpen(false);
    toast.success(`${widget.title} 위젯을 추가했습니다.`);
  };

  const handleAddWidget = (widget: MockWidget) => {
    addWidgetToGrid(widget);
  };

  const handleWidgetPointerDown = (
    widget: MockWidget,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPreview({ widget, x: event.clientX, y: event.clientY });
  };

  const handleRemoveWidget = (
    widget: MockWidget,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const cardEl = event.currentTarget.closest(".widget-card");
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setGhost({
        id: widget.widgetId,
        title: widget.title,
        value: widget.value,
        meta: widget.meta,
        status: widget.status,
        description: widget.description,
        supportingItems: widget.supportingItems,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      // 250ms 뒤에 고스트 제거
      setTimeout(() => {
        setGhost(null);
      }, 250);
    }

    // 그리드 레이아웃과 데이터는 즉시 갱신 (다른 위젯들이 즉각 이동)
    setActiveWidgetIds((currentIds) =>
      currentIds.filter((widgetId) => widgetId !== widget.widgetId),
    );
    setLayout((currentLayout) =>
      currentLayout.filter((item) => item.i !== widget.widgetId),
    );
    toast.success(`${widget.title} 위젯을 숨겼습니다.`);
  };

  return (
    <section
      className={
        isEditing ? "home-workspace home-workspace--editing" : "home-workspace"
      }
    >
      <div className="home-toolbar">
        <div>
          <h1>ESB 이상 징후 탐지 DASHBOARD</h1>
        </div>
        <div className="home-toolbar__actions">
          {isEditing && (
            <button
              className="home-add-button"
              type="button"
              onClick={() => setIsCatalogOpen(true)}
            >
              <IconLayoutGridAdd size={16} aria-hidden="true" />
              위젯 추가
            </button>
          )}
          <button
            className="home-edit-button"
            type="button"
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <IconCheck size={16} aria-hidden="true" />
            ) : (
              <IconPencil size={16} aria-hidden="true" />
            )}
            {isEditing ? "완료" : "편집"}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="widget-layout-frame">
        {mounted && (
          <ReactGridLayout
            className="widget-layout"
            compactor={verticalCompactor}
            dragConfig={{
              enabled: isEditing,
              bounded: true,
              handle: ".widget-card",
              cancel: ".widget-remove-button",
            }}
            gridConfig={{
              cols: widgetGridColumns,
              rowHeight: 226,
              margin: [16, 16],
              containerPadding: null,
            }}
            layout={layout}
            resizeConfig={{ enabled: false }}
            width={width}
            onLayoutChange={setLayout}
          >
            {visibleWidgets.map((widget) => (
              <div key={widget.widgetId} className="widget-grid-item">
                <article
                  className={
                    isEditing
                      ? "widget-card widget-card--editing"
                      : "widget-card"
                  }
                >
                  {isEditing && (
                    <button
                      className="widget-remove-button"
                      type="button"
                      onClick={(event) => handleRemoveWidget(widget, event)}
                    >
                      <IconMinus size={12} aria-hidden="true" />
                      <span className="sr-only">
                        {widget.title} 위젯 숨기기
                      </span>
                    </button>
                  )}
                  <div className="widget-card__header">
                    <h2>{widget.title}</h2>
                    <StatusDot status={widget.status} />
                  </div>
                  <strong>{widget.value}</strong>
                  <p>{widget.meta}</p>
                  <p className="widget-card__description">
                    {widget.description}
                  </p>
                  <ul className="widget-card__supporting-list">
                    {widget.supportingItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
      <Modal
        isOpen={isCatalogOpen}
        onOpenChange={setIsCatalogOpen}
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
              {availableWidgets.map((widget) => (
                <article
                  key={widget.widgetId}
                  className={`widget-preview widget-preview--${widget.size}`}
                >
                  <div className="widget-preview__surface">
                    <div
                      className="widget-preview__drag-source"
                      onPointerDown={(event) =>
                        handleWidgetPointerDown(widget, event)
                      }
                    >
                      <span>{widget.value}</span>
                      <p>{widget.meta}</p>
                    </div>
                  </div>
                  <strong>{widget.title}</strong>
                  <p>{widget.description}</p>
                  <button
                    type="button"
                    onClick={() => handleAddWidget(widget)}
                  >
                    <IconPlus size={16} aria-hidden="true" />
                    추가
                  </button>
                </article>
              ))}
              {availableWidgets.length === 0 && (
                <div className="widget-catalog__empty">
                  추가 가능한 위젯이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
      <AnimatePresence>
        {dragPreview && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={`widget-drag-preview widget-drag-preview--${dragPreview.widget.size}`}
            exit={{ opacity: 0, scale: 0.96 }}
            initial={{ opacity: 0, scale: 0.96 }}
            style={{ left: dragPreview.x, top: dragPreview.y }}
          >
            <span>{dragPreview.widget.value}</span>
            <p>{dragPreview.widget.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {ghost && (
        <div
          className="widget-ghost-card-overlay"
          style={{
            position: "fixed",
            left: ghost.x,
            top: ghost.y,
            width: ghost.width,
            height: ghost.height,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <article className="widget-card widget-card--ghosting">
            <div className="widget-card__header">
              <h2>{ghost.title}</h2>
              <StatusDot status={ghost.status} />
            </div>
            <strong>{ghost.value}</strong>
            {ghost.meta && <p>{ghost.meta}</p>}
            <p className="widget-card__description">{ghost.description}</p>
            <ul className="widget-card__supporting-list">
              {ghost.supportingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  );
};

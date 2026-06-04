import {
  type Layout,
  type LayoutItem,
  useContainerWidth,
} from "react-grid-layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import toast from "react-hot-toast";
import type { UserRole } from "../../../types/app";
import type { MockWidget } from "../../../types/mock";
import {
  createLayoutItem,
  createWidgetLayout,
  getNextLayoutPosition,
  widgetGridColumns,
  widgetSizeMap,
} from "../utils/widgetLayout";

type UseHomeWidgetLayoutParams = {
  role: UserRole;
  homeWidgets: MockWidget[];
  catalogWidgets: MockWidget[];
};

export type DragPreview = {
  widget: MockWidget;
  x: number;
  y: number;
};

export type WidgetGhost = {
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

const defaultHomeWidgetIds = [
  "system-status",
  "severity-trend",
  "major-risk-events",
  "recent-anomaly-logs",
  "recent-alerts",
  "response-code-change",
];

export const useHomeWidgetLayout = ({
  role,
  homeWidgets,
  catalogWidgets,
}: UseHomeWidgetLayoutParams) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [ghost, setGhost] = useState<WidgetGhost | null>(null);
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>([
    ...defaultHomeWidgetIds,
  ]);
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1216,
  });

  const defaultActiveIds = useMemo(
    () =>
      homeWidgets
        .filter((widget) => defaultHomeWidgetIds.includes(widget.widgetId))
        .map((widget) => widget.widgetId),
    [homeWidgets],
  );

  const visibleWidgets = useMemo(
    () => homeWidgets.filter((widget) => activeWidgetIds.includes(widget.widgetId)),
    [activeWidgetIds, homeWidgets],
  );
  const availableWidgets = useMemo(
    () => homeWidgets.filter((widget) => !activeWidgetIds.includes(widget.widgetId)),
    [activeWidgetIds, homeWidgets],
  );
  const initialLayout = useMemo(
    () => createWidgetLayout(visibleWidgets),
    [visibleWidgets],
  );
  const [layout, setLayout] = useState<Layout>(initialLayout);

  const addWidgetToGrid = useCallback(
    (widget: MockWidget, position?: Pick<LayoutItem, "x" | "y">) => {
      setLayout((currentLayout) => {
        if (currentLayout.some((item) => item.i === widget.widgetId)) {
          return currentLayout;
        }

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
    },
    [],
  );

  useEffect(() => {
    const defaultIdsStr = defaultActiveIds.join("|");
    setActiveWidgetIds((current) =>
      current.join("|") === defaultIdsStr ? current : defaultActiveIds,
    );
    setIsEditing(false);
    setIsCatalogOpen(false);
  }, [catalogWidgets, role, defaultActiveIds]);

  useEffect(() => {
    setLayout((currentLayout) => {
      if (visibleWidgets.length === 0) {
        return currentLayout;
      }

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
  }, [addWidgetToGrid, containerRef, dragPreview]);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      toast.success("홈 위젯 배치를 반영했습니다.");
      setIsCatalogOpen(false);
    }

    setIsEditing((current) => !current);
  }, [isEditing]);

  const handleWidgetPointerDown = useCallback(
    (widget: MockWidget, event: ReactPointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragPreview({ widget, x: event.clientX, y: event.clientY });
    },
    [],
  );

  const handleRemoveWidget = useCallback(
    (widget: MockWidget, event: MouseEvent<HTMLButtonElement>) => {
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

        setTimeout(() => {
          setGhost(null);
        }, 250);
      }

      setActiveWidgetIds((currentIds) =>
        currentIds.filter((widgetId) => widgetId !== widget.widgetId),
      );
      setLayout((currentLayout) =>
        currentLayout.filter((item) => item.i !== widget.widgetId),
      );
      toast.success(`${widget.title} 위젯을 숨겼습니다.`);
    },
    [],
  );

  return {
    addWidgetToGrid,
    availableWidgets,
    containerRef,
    dragPreview,
    ghost,
    handleEditToggle,
    handleRemoveWidget,
    handleWidgetPointerDown,
    isCatalogOpen,
    isEditing,
    layout,
    mounted,
    setIsCatalogOpen,
    setLayout,
    visibleWidgets,
    width,
  };
};

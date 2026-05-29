import type { Layout, LayoutItem } from "react-grid-layout";
import type { MockWidget, WidgetSize } from "../../../types/mock";

export const widgetGridColumns = 4;

export const widgetSizeMap: Record<WidgetSize, Pick<LayoutItem, "w" | "h">> = {
  "1x1": { w: 1, h: 1 },
  "2x1": { w: 2, h: 1 },
  "2x2": { w: 2, h: 2 },
  "3x2": { w: 3, h: 2 },
};

export const createLayoutItem = (
  widget: MockWidget,
  x: number,
  y: number,
): LayoutItem => {
  const size = widgetSizeMap[widget.size];

  return {
    i: widget.widgetId,
    x,
    y,
    w: size.w,
    h: size.h,
    minW: size.w,
    minH: size.h,
    maxW: size.w,
    maxH: size.h,
    isResizable: false,
  };
};

export const createWidgetLayout = (widgets: MockWidget[]): Layout => {
  let cursorX = 0;
  let cursorY = 0;

  return widgets.map((widget) => {
    const size = widgetSizeMap[widget.size];

    if (cursorX + size.w > widgetGridColumns) {
      cursorX = 0;
      cursorY += 1;
    }

    const item = createLayoutItem(widget, cursorX, cursorY);

    cursorX += size.w;

    return item;
  });
};

const doesLayoutItemOverlap = (
  item: LayoutItem,
  x: number,
  y: number,
  w: number,
  h: number,
) =>
  x < item.x + item.w &&
  x + w > item.x &&
  y < item.y + item.h &&
  y + h > item.y;

const canPlaceLayoutItem = (
  currentLayout: Layout,
  x: number,
  y: number,
  w: number,
  h: number,
) =>
  x + w <= widgetGridColumns &&
  !currentLayout.some((item) => doesLayoutItemOverlap(item, x, y, w, h));

export const getNextLayoutPosition = (currentLayout: Layout, widget: MockWidget) => {
  const size = widgetSizeMap[widget.size];
  const appendStartY = currentLayout.reduce(
    (maxY, item) => Math.max(maxY, item.y),
    0,
  );
  let y = appendStartY;

  while (true) {
    for (let x = 0; x <= widgetGridColumns - size.w; x += 1) {
      if (canPlaceLayoutItem(currentLayout, x, y, size.w, size.h)) {
        return { x, y };
      }
    }

    y += 1;
  }
};

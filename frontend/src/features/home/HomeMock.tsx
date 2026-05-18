import { IconCheck, IconGripVertical, IconPencil } from "@tabler/icons-react";
import ReactGridLayout, { type Layout, type LayoutItem, useContainerWidth, verticalCompactor } from "react-grid-layout";
import { useEffect, useMemo, useState } from "react";
import { StatusDot } from "../../components/ui/StatusDot";
import { allWidgets } from "../../testing/mocks/mockWidgets";
import type { UserRole } from "../../types/app";
import type { MockWidget, WidgetSize } from "../../types/mock";

type HomeMockProps = {
  role: UserRole;
};

const widgetGridColumns = 4;

const widgetSizeMap: Record<WidgetSize, Pick<LayoutItem, "w" | "h">> = {
  "1x1": { w: 1, h: 1 },
  "2x1": { w: 2, h: 1 },
  "2x2": { w: 2, h: 2 },
  "3x2": { w: 3, h: 2 },
};

const createWidgetLayout = (widgets: MockWidget[]): Layout => {
  let cursorX = 0;
  let cursorY = 0;

  return widgets.map((widget) => {
    const size = widgetSizeMap[widget.size];

    if (cursorX + size.w > widgetGridColumns) {
      cursorX = 0;
      cursorY += 1;
    }

    const item: LayoutItem = {
      i: widget.widgetId,
      x: cursorX,
      y: cursorY,
      w: size.w,
      h: size.h,
      minW: size.w,
      minH: size.h,
      maxW: size.w,
      maxH: size.h,
      isResizable: false,
    };

    cursorX += size.w;

    return item;
  });
};

export const HomeMock = ({ role }: HomeMockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const visibleWidgets = useMemo(() => allWidgets.filter((widget) => widget.role === "all" || widget.role === role), [role]);
  const initialLayout = useMemo(() => createWidgetLayout(visibleWidgets), [visibleWidgets]);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1216 });

  useEffect(() => {
    setLayout(initialLayout);
    setIsEditing(false);
  }, [initialLayout]);

  return (
    <section className={isEditing ? "home-workspace home-workspace--editing" : "home-workspace"}>
      <div className="home-toolbar">
        <div>
          <p className="eyebrow">Widget layout</p>
          <h2>홈 위젯</h2>
        </div>
        <button className="home-edit-button" type="button" onClick={() => setIsEditing((current) => !current)}>
          {isEditing ? <IconCheck size={16} aria-hidden="true" /> : <IconPencil size={16} aria-hidden="true" />}
          {isEditing ? "완료" : "편집"}
        </button>
      </div>

      <div ref={containerRef} className="widget-layout-frame">
        {mounted && (
          <ReactGridLayout
            className="widget-layout"
            compactor={verticalCompactor}
            dragConfig={{ enabled: isEditing, bounded: true, handle: ".widget-drag-handle" }}
            gridConfig={{ cols: widgetGridColumns, rowHeight: 226, margin: [16, 16], containerPadding: null }}
            layout={layout}
            resizeConfig={{ enabled: false }}
            width={width}
            onLayoutChange={setLayout}
          >
            {visibleWidgets.map((widget) => (
              <div key={widget.widgetId} className="widget-grid-item">
                <article className={isEditing ? "widget-card widget-card--editing" : "widget-card"}>
                  {isEditing && (
                    <button className="widget-drag-handle" type="button" aria-label={`${widget.title} 위젯 이동`}>
                      <IconGripVertical size={16} aria-hidden="true" />
                    </button>
                  )}
                  <div className="widget-card__header">
                    <h2>{widget.title}</h2>
                    <StatusDot status={widget.status} />
                  </div>
                  <strong>{widget.value}</strong>
                  <p>{widget.meta}</p>
                  <p className="widget-card__description">{widget.description}</p>
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
    </section>
  );
};

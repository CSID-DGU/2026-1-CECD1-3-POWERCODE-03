import { IconCheck, IconGridDots, IconGripVertical, IconLayoutGridAdd, IconPencil, IconPlus, IconSearch } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import ReactGridLayout, { type Layout, type LayoutItem, useContainerWidth, verticalCompactor } from "react-grid-layout";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { StatusDot } from "../../components/ui/StatusDot";
import { allWidgets, homeWidgetItems, widgetCatalogItems } from "../../testing/mocks/mockWidgets";
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
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const baseWidgets = useMemo(() => allWidgets.filter((widget) => widget.role === "all" || widget.role === role), [role]);
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(() => baseWidgets.map((widget) => widget.widgetId));
  const visibleWidgets = useMemo(
    () => homeWidgetItems.filter((widget) => activeWidgetIds.includes(widget.widgetId) && (widget.role === "all" || widget.role === role)),
    [activeWidgetIds, role],
  );
  const availableWidgets = useMemo(
    () => widgetCatalogItems.filter((widget) => !activeWidgetIds.includes(widget.widgetId) && (widget.role === "all" || widget.role === role)),
    [activeWidgetIds, role],
  );
  const initialLayout = useMemo(() => createWidgetLayout(visibleWidgets), [visibleWidgets]);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1216 });

  useEffect(() => {
    const nextBaseWidgets = allWidgets.filter((widget) => widget.role === "all" || widget.role === role);
    setActiveWidgetIds(nextBaseWidgets.map((widget) => widget.widgetId));
    setIsEditing(false);
    setIsCatalogOpen(false);
  }, [role]);

  useEffect(() => {
    setLayout((currentLayout) => {
      const currentById = new Map(currentLayout.map((item) => [item.i, item]));
      return visibleWidgets.map((widget, index) => currentById.get(widget.widgetId) ?? initialLayout[index]);
    });
  }, [initialLayout, visibleWidgets]);

  const handleEditToggle = () => {
    if (isEditing) {
      toast.success("홈 위젯 배치를 반영했습니다.");
      setIsCatalogOpen(false);
    }

    setIsEditing((current) => !current);
  };

  const handleAddWidget = (widget: MockWidget) => {
    setActiveWidgetIds((currentIds) => [...currentIds, widget.widgetId]);
    setIsCatalogOpen(false);
    toast.success(`${widget.title} 위젯을 추가했습니다.`);
  };

  return (
    <section className={isEditing ? "home-workspace home-workspace--editing" : "home-workspace"}>
      <div className="home-toolbar">
        <div>
          <p className="eyebrow">Widget layout</p>
          <h2>홈 위젯</h2>
        </div>
        <div className="home-toolbar__actions">
          {isEditing && (
            <button className="home-add-button" type="button" onClick={() => setIsCatalogOpen(true)}>
              <IconLayoutGridAdd size={16} aria-hidden="true" />
              위젯 추가
            </button>
          )}
          <button className="home-edit-button" type="button" onClick={handleEditToggle}>
            {isEditing ? <IconCheck size={16} aria-hidden="true" /> : <IconPencil size={16} aria-hidden="true" />}
            {isEditing ? "완료" : "편집"}
          </button>
        </div>
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
      <AnimatePresence>
        {isCatalogOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="widget-catalog-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.aside
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="widget-catalog"
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <div className="widget-catalog__sidebar">
                <div className="widget-catalog__search">
                  <IconSearch size={18} aria-hidden="true" />
                  <span>위젯 검색</span>
                </div>
                <button className="widget-catalog__category widget-catalog__category--active" type="button">
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
                <div className="widget-catalog__header">
                  <div>
                    <p className="eyebrow">Widget gallery</p>
                    <h3>위젯 추가</h3>
                  </div>
                  <button className="widget-catalog__close" type="button" onClick={() => setIsCatalogOpen(false)}>
                    완료
                  </button>
                </div>

                <div className="widget-catalog__grid">
                  {availableWidgets.map((widget) => (
                    <article key={widget.widgetId} className={`widget-preview widget-preview--${widget.size}`}>
                      <div className="widget-preview__surface">
                        <div>
                          <span>{widget.value}</span>
                          <p>{widget.meta}</p>
                        </div>
                      </div>
                      <strong>{widget.title}</strong>
                      <p>{widget.description}</p>
                      <button type="button" onClick={() => handleAddWidget(widget)}>
                        <IconPlus size={16} aria-hidden="true" />
                        추가
                      </button>
                    </article>
                  ))}
                  {availableWidgets.length === 0 && (
                    <div className="widget-catalog__empty">추가 가능한 위젯이 없습니다.</div>
                  )}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

import React from "react";
import {
  IconCheck,
  IconLayoutGridAdd,
  IconPencil,
  IconRefresh,
} from "@tabler/icons-react";
import { AnimatePresence } from "motion/react";
import ReactGridLayout, { verticalCompactor } from "react-grid-layout";
import type { UserRole, ViewId } from "../../types/app";
import { HomeWidgetCard } from "./components/HomeWidgetCard";
import { HomeWidgetContent } from "./components/HomeWidgetContent";
import { WidgetCatalogOverlay } from "./components/WidgetCatalogOverlay";
import { WidgetDragPreview } from "./components/WidgetDragPreview";
import { useWidgetCatalog, useWidgets } from "../../hooks/useWidgets";
import { useHomeWidgetLayout } from "./hooks/useHomeWidgetLayout";
import { widgetGridColumns } from "./utils/widgetLayout";

type HomeMockProps = {
  role: UserRole;
  onSelectView?: (view: ViewId) => void;
};

export const HomeMock = ({ role, onSelectView }: HomeMockProps) => {
  const { widgets: homeWidgets } = useWidgets(role);
  const [syncTime, setSyncTime] = React.useState<number>(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSyncTime((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSyncTime(0);
      setIsRefreshing(false);
    }, 600);
  };
  const { widgets: catalogWidgets } = useWidgetCatalog(role);
  const {
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
  } = useHomeWidgetLayout({ role, homeWidgets, catalogWidgets });

  return (
    <section
      className={
        isEditing ? "home-workspace home-workspace--editing" : "home-workspace"
      }
    >
      <div className="home-toolbar">
        <div className="system-status-indicator">
          <div className="system-status-badge">
            <span className="system-status-dot" />
            <span className="system-status-text">System Operational</span>
          </div>
          <span className="system-status-separator">|</span>
          <span className="system-status-sync">
            최근 동기화: {syncTime === 0 ? "방금 전" : `${syncTime}분 전`}
          </span>
          <button
            type="button"
            className={`system-status-sync-btn ${
              isRefreshing ? "system-status-sync-btn--refreshing" : ""
            }`}
            onClick={handleRefresh}
            title="새로고침"
            aria-label="데이터 새로고침"
          >
            <IconRefresh size={14} aria-hidden="true" />
          </button>
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
                <HomeWidgetCard
                  widget={widget}
                  isEditing={isEditing}
                  onRemove={(event) => handleRemoveWidget(widget, event)}
                >
                  <HomeWidgetContent
                    widget={widget}
                    isEditing={isEditing}
                    onSelectView={onSelectView}
                  />
                </HomeWidgetCard>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>

      <WidgetCatalogOverlay
        isOpen={isCatalogOpen}
        widgets={availableWidgets}
        onOpenChange={setIsCatalogOpen}
        onAddWidget={addWidgetToGrid}
        onWidgetPointerDown={handleWidgetPointerDown}
      />

      <AnimatePresence>
        {dragPreview && (
          <WidgetDragPreview
            widget={dragPreview.widget}
            x={dragPreview.x}
            y={dragPreview.y}
          />
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

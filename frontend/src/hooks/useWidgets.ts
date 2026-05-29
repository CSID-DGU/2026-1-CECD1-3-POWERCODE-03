import { useEffect, useState } from "react";
import {
  fetchWidgetCatalog,
  fetchWidgets,
  getWidgetCatalogSnapshot,
  getWidgetsSnapshot,
} from "../services/mock/widget.mock";
import type { UserRole } from "../types/app";
import type { Widget } from "../types/domain";

export function useWidgets(role: UserRole) {
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    getWidgetsSnapshot(role),
  );

  useEffect(() => {
    let isMounted = true;

    fetchWidgets(role).then((response) => {
      if (!isMounted) return;
      setWidgets((current) =>
        current.map((widget) => widget.widgetId).join("|") ===
        response.map((widget) => widget.widgetId).join("|")
          ? current
          : response,
      );
    });

    return () => {
      isMounted = false;
    };
  }, [role]);

  return { widgets };
}

export function useWidgetCatalog(role: UserRole) {
  const [widgets, setWidgets] = useState<Widget[]>(() =>
    getWidgetCatalogSnapshot(role),
  );

  useEffect(() => {
    let isMounted = true;

    fetchWidgetCatalog(role).then((response) => {
      if (!isMounted) return;
      setWidgets((current) =>
        current.map((widget) => widget.widgetId).join("|") ===
        response.map((widget) => widget.widgetId).join("|")
          ? current
          : response,
      );
    });

    return () => {
      isMounted = false;
    };
  }, [role]);

  return { widgets };
}

import { allWidgets, homeWidgetItems } from "../../testing/mocks/mockWidgets";
import type { UserRole } from "../../types/app";

export function getWidgetsSnapshot(role: UserRole) {
  return homeWidgetItems.filter(
    (widget) => widget.role === "all" || widget.role === role,
  );
}

export function getWidgetCatalogSnapshot(role: UserRole) {
  return allWidgets.filter(
    (widget) => widget.role === "all" || widget.role === role,
  );
}

export async function fetchWidgets(role: UserRole) {
  return getWidgetsSnapshot(role);
}

export async function fetchWidgetCatalog(role: UserRole) {
  return getWidgetCatalogSnapshot(role);
}

import type { ViewId } from "../types/app";

export const isAdminView = (viewId: ViewId) => viewId === "system" || viewId === "model";

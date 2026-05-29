import type { UserRole } from "../../types/app";
import type { Widget } from "../../types/domain";
import { httpClient } from "./client";

export function fetchWidgets(role: UserRole): Promise<Widget[]> {
  return httpClient.get("/api/widgets", { params: { role } });
}

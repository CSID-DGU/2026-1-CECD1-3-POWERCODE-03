import { useState } from "react";
import type { ViewId } from "../types/app";

export const useActiveView = (initialView: ViewId = "home") => {
  return useState<ViewId>(initialView);
};

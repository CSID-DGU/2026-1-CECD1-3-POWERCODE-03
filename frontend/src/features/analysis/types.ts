import type { Icon } from "@tabler/icons-react";
import type {
  MessageBodyPreview,
  MessageSnapshot,
  ProcessSnapshot,
  TransactionSnapshot,
} from "../../types/domain";
import type { MockAnomalyLog } from "../../types/mock";

export type SeverityFilter = MockAnomalyLog["severity"];
export type AnalysisStatus = MockAnomalyLog["status"];
export type AnalysisCategory = "All" | SeverityFilter | "Open" | "Resolved";
export type StatusOverrides = Record<string, AnalysisStatus>;

export type CategoryTheme = {
  icon: Icon;
  label: string;
  group: "severity" | "workflow" | "all";
  className: string;
};

export type SortOption = "severity_desc" | "severity_asc" | "time_desc" | "time_asc";
export type TypingPhase = "summary" | "cause" | "action" | "done";

export type AnalysisNode =
  | {
      type: "focusProcess" | "contextProcess";
      id: string;
      label: string;
      data: ProcessSnapshot;
    }
  | {
      type: "transactionContext";
      id: string;
      label: string;
      data: TransactionSnapshot;
    }
  | {
      type: "message";
      id: string;
      label: string;
      data: MessageSnapshot;
    }
  | {
      type: "body";
      id: string;
      label: string;
      data: MessageBodyPreview;
    };

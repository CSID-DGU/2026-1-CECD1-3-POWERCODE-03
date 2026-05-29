import type { PropsWithChildren } from "react";

type StatusPillProps = PropsWithChildren<{
  tone: "info";
}>;

export const StatusPill = ({ children, tone }: StatusPillProps) => (
  <span className={`status-pill status-pill--${tone}`}>{children}</span>
);

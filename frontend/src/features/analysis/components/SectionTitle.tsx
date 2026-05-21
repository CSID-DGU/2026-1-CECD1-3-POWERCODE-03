import type { ReactNode } from "react";

type SectionTitleProps = {
  icon: ReactNode;
  title: string;
};

export const SectionTitle = ({ icon, title }: SectionTitleProps) => (
  <div className="analysis-section-title">
    {icon}
    <h3>{title}</h3>
  </div>
);

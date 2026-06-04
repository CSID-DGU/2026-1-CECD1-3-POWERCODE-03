import type { CSSProperties, ReactNode } from "react";

export interface SettingsCardProps {
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  cardClassName?: string;
  children: ReactNode;
  className?: string;
  headerAddon?: ReactNode;
  renderHeader?: (title: ReactNode) => ReactNode;
  title: ReactNode;
  titleClassName?: string;
}

export const SettingsCard = ({
  bodyClassName,
  bodyStyle,
  cardClassName,
  children,
  className,
  headerAddon,
  renderHeader,
  title,
  titleClassName,
}: SettingsCardProps) => (
  <section className={["settings-section", className].filter(Boolean).join(" ")}>
    <div className={["settings-section__title", titleClassName].filter(Boolean).join(" ")}>
      {renderHeader ? (
        renderHeader(title)
      ) : (
        <>
          <h3>{title}</h3>
          {headerAddon}
        </>
      )}
    </div>
    <div className={["settings-card", cardClassName].filter(Boolean).join(" ")}>
      <div
        className={["settings-card__body", bodyClassName].filter(Boolean).join(" ")}
        style={bodyStyle}
      >
        {children}
      </div>
    </div>
  </section>
);

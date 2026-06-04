import type { ReactNode } from "react";
import { Switch } from "../../../components/ui/switch";
import { SettingsCard } from "./SettingsCard";

type IntegrationCardProps = {
  children?: ReactNode;
  description: string;
  enabled: boolean;
  icon: ReactNode;
  iconBackground: string;
  onEnabledChange: (enabled: boolean) => void;
  title: string;
  titleLabel: string;
};

export const IntegrationCard = ({
  children,
  description,
  enabled,
  icon,
  iconBackground,
  onEnabledChange,
  title,
  titleLabel,
}: IntegrationCardProps) => (
  <SettingsCard title={title}>
    <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "8px", backgroundColor: iconBackground, alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <div>
            <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>
              {titleLabel}
            </strong>
            <p style={{ margin: "2px 0 0", color: "var(--body)", fontSize: "12px" }}>
              {description}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && children}
    </div>
  </SettingsCard>
);

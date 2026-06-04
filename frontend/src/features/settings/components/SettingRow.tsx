import { useState } from "react";
import { Switch } from "../../../components/ui/switch";

type SettingRowProps = {
  description: string;
  enabled?: boolean;
  label: string;
};

export const SettingRow = ({
  description,
  enabled = false,
  label,
}: SettingRowProps) => {
  const [checked, setChecked] = useState(enabled);

  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        aria-label={`${label} ${checked ? "켜짐" : "꺼짐"}`}
      />
    </div>
  );
};

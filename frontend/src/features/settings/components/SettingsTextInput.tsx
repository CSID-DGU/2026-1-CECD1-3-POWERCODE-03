import type { ChangeEventHandler, HTMLInputTypeAttribute, ReactNode } from "react";

type SettingsTextInputProps = {
  action?: ReactNode;
  gridColumn?: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: HTMLInputTypeAttribute;
  value: string;
};

export const SettingsTextInput = ({
  action,
  gridColumn,
  label,
  onChange,
  type = "text",
  value,
}: SettingsTextInputProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn }}>
    <label style={{ fontSize: "11px", color: "var(--mute)", fontWeight: "bold" }}>
      {label}
    </label>
    <div style={{ display: action ? "flex" : "block", gap: "8px" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          flex: action ? 1 : undefined,
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--hairline)",
          background: "var(--canvas-soft)",
          color: "var(--ink)",
          fontSize: "12px",
        }}
      />
      {action}
    </div>
  </div>
);

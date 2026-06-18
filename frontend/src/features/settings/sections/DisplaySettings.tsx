import { useState } from "react";
import toast from "react-hot-toast";
import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";
import {
  dashboardDisplaySettings,
  homeWidgetSettings,
} from "../settingsConfig";

export const DisplaySettings = () => (
  <div className="settings-grid">
    <SettingsCard title="대시보드 표시">
      {dashboardDisplaySettings.map((setting) => (
        <SettingRow key={setting.label} {...setting} />
      ))}
    </SettingsCard>
    
    <SettingsCard title="테마 선택">
      <ThemeSettings />
    </SettingsCard>
    
    <SettingsCard title="홈 위젯">
      {homeWidgetSettings.map((setting) => (
        <SettingRow key={setting.label} {...setting} />
      ))}
    </SettingsCard>
  </div>
);

const ThemeSettings = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <div className="settings-theme-grid">
      <button
        onClick={() => {
          setTheme("light");
          toast.success("화이트 (라이트 테마)로 설정되었습니다.");
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          border: `2px solid ${theme === "light" ? "var(--theme-color, #7c3aed)" : "var(--hairline)"}`,
          background: "#ffffff",
          color: "#1a1a1a",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        className="theme-option"
      >
        <div className="theme-preview theme-preview--light">
          <div className="theme-preview__sidebar" />
          <div className="theme-preview__accent" />
          <div className="theme-preview__line" />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>화이트 (라이트 테마)</span>
      </button>

      <button
        onClick={() => {
          setTheme("dark");
          toast.success("블랙 (다크 테마)로 설정되었습니다.");
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          border: `2px solid ${theme === "dark" ? "var(--theme-color, #7c3aed)" : "var(--hairline)"}`,
          background: "#121212",
          color: "#ffffff",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        className="theme-option"
      >
        <div className="theme-preview theme-preview--dark">
          <div className="theme-preview__sidebar" />
          <div className="theme-preview__accent" />
          <div className="theme-preview__line" />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>블랙 (다크 테마)</span>
      </button>
    </div>
  );
};

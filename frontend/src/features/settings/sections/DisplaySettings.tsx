import { useState } from "react";
import toast from "react-hot-toast";
import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";

export const DisplaySettings = () => (
  <div className="settings-grid">
    <SettingsCard title="대시보드 표시">
      <SettingRow
        label="밀도 높은 레이아웃"
        description="운영 모니터링에 맞춰 카드 간격을 좁게 유지합니다."
        enabled
      />
      <SettingRow
        label="상단 헤더 축소"
        description="분석 화면에서 콘텐츠 영역을 더 크게 사용합니다."
        enabled
      />
      <SettingRow
        label="숫자 강조"
        description="위험도 점수와 처리시간 수치를 더 크게 표시합니다."
      />
    </SettingsCard>
    
    <SettingsCard title="테마 선택">
      <ThemeSettings />
    </SettingsCard>
    
    <SettingsCard title="홈 위젯">
      <SettingRow
        label="빈 위젯 catalog 표시"
        description="숨긴 위젯과 추가 가능한 위젯을 갤러리에서 관리합니다."
        enabled
      />
    </SettingsCard>
  </div>
);

const ThemeSettings = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "var(--space-md)" }}>
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
        <div style={{
          width: "100%",
          height: "48px",
          background: "#f8f9fa",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #dee2e6",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ width: "30%", height: "100%", background: "#ffffff", borderRight: "1px solid #dee2e6", position: "absolute", left: 0 }} />
          <div style={{ width: "50%", height: "8px", background: "#7c3aed", borderRadius: "4px", position: "absolute", top: "12px", left: "40%" }} />
          <div style={{ width: "40%", height: "6px", background: "#adb5bd", borderRadius: "3px", position: "absolute", top: "26px", left: "40%" }} />
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
        <div style={{
          width: "100%",
          height: "48px",
          background: "#1e1e1e",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #2d2d2d",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ width: "30%", height: "100%", background: "#181818", borderRight: "1px solid #2d2d2d", position: "absolute", left: 0 }} />
          <div style={{ width: "50%", height: "8px", background: "#7c3aed", borderRadius: "4px", position: "absolute", top: "12px", left: "40%" }} />
          <div style={{ width: "40%", height: "6px", background: "#495057", borderRadius: "3px", position: "absolute", top: "26px", left: "40%" }} />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>블랙 (다크 테마)</span>
      </button>
    </div>
  );
};

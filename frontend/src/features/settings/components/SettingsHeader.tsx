import {
  IconArrowsMaximize,
  IconArrowsMinimize,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import type { SettingsSection } from "../types";

type SettingsHeaderProps = {
  config: SettingsSection;
  isWide: boolean;
  onToggleWide: (val: boolean) => void;
};

export const SettingsHeader = ({
  config,
  isWide,
  onToggleWide,
}: SettingsHeaderProps) => (
  <header className="settings-header">
    <div>
      <h2>
        <span className={`settings-heading-icon ${config.className}`}>
          {config.icon}
        </span>
        {config.label}
      </h2>
    </div>
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onToggleWide(!isWide)}
        aria-label={isWide ? "콤팩트 화면으로 보기" : "넓은 화면으로 보기"}
      >
        {isWide ? (
          <IconArrowsMinimize size={15} />
        ) : (
          <IconArrowsMaximize size={15} />
        )}
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("설정 변경사항을 저장했습니다.")}
      >
        변경사항 저장
      </Button>
    </div>
  </header>
);

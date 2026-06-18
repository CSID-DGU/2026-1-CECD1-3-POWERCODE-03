import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";
import { SeverityChannelRow } from "../components/SeverityChannelRow";
import {
  notificationTimeSettings,
  severityChannelSettings,
} from "../settingsConfig";

export const NotificationSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="위험도별 알림 채널 설정">
      <div className="settings-channel-list">
        {severityChannelSettings.map((setting) => (
          <SeverityChannelRow key={setting.severity} {...setting} />
        ))}
      </div>
    </SettingsCard>

    <SettingsCard title="알림 시간">
      {notificationTimeSettings.map((setting) => (
        <SettingRow key={setting.label} {...setting} />
      ))}
    </SettingsCard>
  </div>
);

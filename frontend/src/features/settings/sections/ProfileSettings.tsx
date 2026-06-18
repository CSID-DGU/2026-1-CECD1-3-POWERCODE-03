import { ProfileField } from "../components/ProfileField";
import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";
import {
  feedbackSettings,
  permissionSettings,
  profileDefaults,
} from "../settingsConfig";

export const ProfileSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="사용자 기본값">
      {profileDefaults.map((field) => (
        <ProfileField key={field.label} {...field} />
      ))}
    </SettingsCard>
    
    <SettingsCard title="권한 표시">
      {permissionSettings.map((setting) => (
        <SettingRow key={setting.label} {...setting} />
      ))}
    </SettingsCard>
    
    <SettingsCard title="피드백">
      {feedbackSettings.map((setting) => (
        <SettingRow key={setting.label} {...setting} />
      ))}
    </SettingsCard>
  </div>
);

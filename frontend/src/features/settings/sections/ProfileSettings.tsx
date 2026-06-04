import { ProfileField } from "../components/ProfileField";
import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";

export const ProfileSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="사용자 기본값">
      <ProfileField label="기본 역할" value="일반 사용자" />
      <ProfileField label="기본 진입 화면" value="홈" />
      <ProfileField label="시간대" value="Asia/Seoul" />
    </SettingsCard>
    
    <SettingsCard title="권한 표시">
      <SettingRow
        label="관리자 탭 숨김"
        description="일반 사용자 모드에서는 시스템 설정과 모델 관리를 숨깁니다."
        enabled
      />
      <SettingRow
        label="상태 변경 확인"
        description="Open/Resolved 전환 전 확인 절차를 둘 수 있습니다."
      />
    </SettingsCard>
    
    <SettingsCard title="피드백">
      <SettingRow
        label="Toast 알림"
        description="저장, 복사, 상태 변경 결과를 화면에 표시합니다."
        enabled
      />
      <SettingRow
        label="효과음"
        description="운영 대시보드에서는 기본 비활성화합니다."
      />
    </SettingsCard>
  </div>
);

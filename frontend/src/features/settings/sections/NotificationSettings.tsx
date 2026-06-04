import { SettingsCard } from "../components/SettingsCard";
import { SettingRow } from "../components/SettingRow";
import { SeverityChannelRow } from "../components/SeverityChannelRow";

export const NotificationSettings = () => (
  <div className="settings-grid">
    <SettingsCard title="위험도별 알림 채널 설정">
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <SeverityChannelRow
          severity="critical"
          label="위험"
          subLabel="Critical"
          description="가장 높은 위험도. 즉각적인 조치가 필요한 심각한 장애 상황"
          defaultDashboard={true}
          defaultEmail={true}
          defaultSlack={true}
        />
        <SeverityChannelRow
          severity="warning"
          label="주의"
          subLabel="Warning"
          description="중간 위험도. 단기 패턴 어긋남 또는 임계치 부근 감지"
          defaultDashboard={true}
          defaultEmail={false}
          defaultSlack={true}
        />
        <SeverityChannelRow
          severity="info"
          label="참고"
          subLabel="Info"
          description="가장 낮은 위험도. 단순 프로세스 단기 지연 또는 무해한 변동"
          defaultDashboard={false}
          defaultEmail={false}
          defaultSlack={false}
        />
      </div>
    </SettingsCard>

    <SettingsCard title="알림 시간">
      <SettingRow
        label="운영 시간 우선"
        description="평일 09:00-18:00에는 모든 알림을 즉시 표시합니다."
        enabled
      />
      <SettingRow
        label="야간 알림 축소"
        description="야간에는 위험 단계 알림만 스마트폰 슬랙으로 즉시 발송합니다."
        enabled
      />
    </SettingsCard>
  </div>
);

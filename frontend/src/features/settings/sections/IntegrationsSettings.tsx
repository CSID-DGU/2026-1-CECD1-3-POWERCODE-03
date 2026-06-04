import {
  IconBrandSlack,
  IconMail,
  IconWebhook,
} from "@tabler/icons-react";
import { Button } from "../../../components/ui/button";
import { IntegrationCard } from "../components/IntegrationCard";
import { SettingsTextInput } from "../components/SettingsTextInput";
import { useIntegrationSettings } from "../hooks/useIntegrationSettings";

export const IntegrationsSettings = () => {
  const {
    emailEnabled,
    emailPort,
    emailSmtp,
    emailUser,
    handleTestEmail,
    handleTestSlack,
    handleTestWebhook,
    setEmailEnabled,
    setEmailPort,
    setEmailSmtp,
    setEmailUser,
    setSlackEnabled,
    setSlackUrl,
    setWebhookEnabled,
    setWebhookUrl,
    slackEnabled,
    slackUrl,
    webhookEnabled,
    webhookUrl,
  } = useIntegrationSettings();

  return (
    <div className="settings-grid">
      <IntegrationCard
        title="Slack 알림 연동"
        titleLabel="Slack Incoming Webhook"
        description="지정한 슬랙 채널로 이상 징후 알림 카드를 실시간 전송합니다."
        enabled={slackEnabled}
        icon={<IconBrandSlack size={24} style={{ color: "#4A154B" }} />}
        iconBackground="#f4ede4"
        onEnabledChange={setSlackEnabled}
      >
        <SettingsTextInput
          label="WEBHOOK URL"
          type="password"
          value={slackUrl}
          onChange={(event) => setSlackUrl(event.target.value)}
          action={
            <Button size="sm" variant="outline" onClick={handleTestSlack}>
              테스트 전송
            </Button>
          }
        />
      </IntegrationCard>

      <IntegrationCard
        title="이메일 (SMTP) 연동"
        titleLabel="SMTP 아웃바운드 서버"
        description="사내 메일 서버를 통해 관리자들에게 이상 감지 경보 메일을 발송합니다."
        enabled={emailEnabled}
        icon={<IconMail size={24} style={{ color: "var(--theme-color, #2f6fed)" }} />}
        iconBackground="var(--theme-soft, #e8f0ff)"
        onEnabledChange={setEmailEnabled}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginTop: "4px" }}>
          <SettingsTextInput
            label="SMTP 호스트"
            value={emailSmtp}
            onChange={(event) => setEmailSmtp(event.target.value)}
          />
          <SettingsTextInput
            label="포트"
            value={emailPort}
            onChange={(event) => setEmailPort(event.target.value)}
          />
          <SettingsTextInput
            gridColumn="span 2"
            label="발신 계정"
            value={emailUser}
            onChange={(event) => setEmailUser(event.target.value)}
            action={
              <Button size="sm" variant="outline" onClick={handleTestEmail}>
                연동 테스트
              </Button>
            }
          />
        </div>
      </IntegrationCard>

      <IntegrationCard
        title="커스텀 Webhook 연동"
        titleLabel="Webhook (JSON POST)"
        description="지정한 엔드포인트 URL로 실시간 이상 감지 페이로드를 POST 요청으로 전송합니다."
        enabled={webhookEnabled}
        icon={<IconWebhook size={24} style={{ color: "#3b82f6" }} />}
        iconBackground="#eef2f6"
        onEnabledChange={setWebhookEnabled}
      >
        <SettingsTextInput
          label="엔드포인트 URL"
          value={webhookUrl}
          onChange={(event) => setWebhookUrl(event.target.value)}
          action={
            <Button size="sm" variant="outline" onClick={handleTestWebhook}>
              테스트 호출
            </Button>
          }
        />
      </IntegrationCard>
    </div>
  );
};

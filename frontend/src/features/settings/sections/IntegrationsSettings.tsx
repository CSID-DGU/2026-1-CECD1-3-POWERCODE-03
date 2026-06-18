import { Button } from "../../../components/ui/button";
import { IntegrationCard } from "../components/IntegrationCard";
import { SettingsTextInput } from "../components/SettingsTextInput";
import { useIntegrationSettings } from "../hooks/useIntegrationSettings";
import { integrationMeta } from "../settingsConfig";

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
  const SlackIcon = integrationMeta.slack.icon;
  const EmailIcon = integrationMeta.email.icon;
  const WebhookIcon = integrationMeta.webhook.icon;

  return (
    <div className="settings-grid">
      <IntegrationCard
        title={integrationMeta.slack.title}
        titleLabel={integrationMeta.slack.titleLabel}
        description={integrationMeta.slack.description}
        enabled={slackEnabled}
        icon={<SlackIcon size={24} style={{ color: integrationMeta.slack.iconColor }} />}
        iconBackground={integrationMeta.slack.iconBackground}
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
        title={integrationMeta.email.title}
        titleLabel={integrationMeta.email.titleLabel}
        description={integrationMeta.email.description}
        enabled={emailEnabled}
        icon={<EmailIcon size={24} style={{ color: integrationMeta.email.iconColor }} />}
        iconBackground={integrationMeta.email.iconBackground}
        onEnabledChange={setEmailEnabled}
      >
        <div className="settings-smtp-grid">
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
        title={integrationMeta.webhook.title}
        titleLabel={integrationMeta.webhook.titleLabel}
        description={integrationMeta.webhook.description}
        enabled={webhookEnabled}
        icon={<WebhookIcon size={24} style={{ color: integrationMeta.webhook.iconColor }} />}
        iconBackground={integrationMeta.webhook.iconBackground}
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

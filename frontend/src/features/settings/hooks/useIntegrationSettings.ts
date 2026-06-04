import { useState } from "react";
import toast from "react-hot-toast";

const integrationInitialValues = {
  emailPort: "587",
  emailSmtp: "smtp.company-esb.com",
  emailUser: "alert-system@company.com",
  slackUrl: "https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_TOKEN_KEY",
  webhookUrl: "https://api.company-esb.com/v1/webhook-receiver",
};

const simulateIntegrationTest = (
  delay: number,
  messages: {
    error: string;
    loading: string;
    success: string;
  },
) => {
  toast.promise(new Promise((resolve) => setTimeout(resolve, delay)), messages);
};

export const useIntegrationSettings = () => {
  const [slackUrl, setSlackUrl] = useState(integrationInitialValues.slackUrl);
  const [emailSmtp, setEmailSmtp] = useState(integrationInitialValues.emailSmtp);
  const [emailPort, setEmailPort] = useState(integrationInitialValues.emailPort);
  const [emailUser, setEmailUser] = useState(integrationInitialValues.emailUser);
  const [webhookUrl, setWebhookUrl] = useState(integrationInitialValues.webhookUrl);
  
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);

  const handleTestSlack = () => {
    simulateIntegrationTest(1000, {
      loading: "Slack 테스트 메시지 전송 중...",
      success: "Slack으로 테스트 알림이 성공적으로 발송되었습니다!",
      error: "전송 실패",
    });
  };

  const handleTestEmail = () => {
    simulateIntegrationTest(1200, {
      loading: "SMTP 테스트 메일 전송 중...",
      success: "SMTP 서버 연결 성공! 테스트 메일이 발송되었습니다.",
      error: "연결 실패",
    });
  };

  const handleTestWebhook = () => {
    simulateIntegrationTest(1100, {
      loading: "Webhook 테스트 호출 중...",
      success: "Webhook POST 호출 성공! (상태코드 200 OK)",
      error: "호출 실패",
    });
  };

  return {
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
  };
};

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Debug log to check if .env variables are loaded successfully
console.log('[Email Config Status] Loading SMTP Settings...');
console.log(`- SMTP Host: ${SMTP_HOST}`);
console.log(`- SMTP Port: ${SMTP_PORT}`);
console.log(`- SMTP User: ${SMTP_USER || '❌ Not Found'}`);
console.log(`- SMTP Pass: ${SMTP_PASS ? `✅ Configured (Length: ${SMTP_PASS.length})` : '❌ Not Found'}`);

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  // If SMTP user/password is not configured, fallback to Mock console logging
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('\n=============================================================');
    console.log(`✉️  [EMAIL MOCK MODE] Verification code for: ${email}`);
    console.log(`🔑  CODE: ${code}`);
    console.log('💡  To send real emails, set SMTP_USER and SMTP_PASS in .env');
    console.log('=============================================================\n');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bypass self-signed certificate error in local env
      },
    });

    const mailOptions = {
      from: `"POWERCODE Control" <${SMTP_USER}>`,
      to: email,
      subject: '[POWERCODE] 회원가입 이메일 인증 코드',
      html: `
        <div style="font-family: 'Pretendard', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; border: 1px solid #ebebeb; border-radius: 12px; background-color: #ffffff; color: #171717;">
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #a1a1a1; margin: 0 0 4px 0;">ESB Anomaly Detection</p>
            <h1 style="font-size: 20px; font-weight: 700; margin: 0; color: #171717;">이메일 인증 안내</h1>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #4d4d4d; margin: 0 0 24px 0; text-align: center;">
            POWERCODE 종합 통제 대시보드 회원가입을 위한 인증 코드입니다.<br>
            아래의 6자리 코드를 회원가입 화면에 입력해 주세요.
          </p>
          
          <div style="background-color: #fafafa; border: 1px solid #ebebeb; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #171717; font-family: monospace;">${code}</span>
          </div>
          
          <p style="font-size: 12px; line-height: 1.5; color: #888888; margin: 0; text-align: center;">
            본 인증 코드는 발송 후 5분간 유효합니다.<br>
            요청한 적이 없다면 이 이메일을 무시하셔도 좋습니다.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
    // If sending fails, fallback to console mock code so register flow is not completely blocked
    console.log('\n=============================================================');
    console.log(`✉️  [EMAIL SEND ERROR FALLBACK] Verification code for: ${email}`);
    console.log(`🔑  CODE: ${code}`);
    console.log('=============================================================\n');
    return false;
  }
}

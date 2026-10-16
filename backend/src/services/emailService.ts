import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter | null {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const host = process.env.SMTP_HOST || (user && user.endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = port === 465;

    if (!user || !pass || !host) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    }

    return this.transporter;
  }

  public static async sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromAddress =
      process.env.EMAIL_FROM ||
      (process.env.SMTP_USER ? `"QuantumShield Security" <${process.env.SMTP_USER}>` : '"QuantumShield Security" <no-reply@quantumshield.in>');

    if (!transporter) {
      // In production or test when SMTP is not configured in environment variables,
      // log to secure server stdout only — NEVER exposed to the frontend or API response.
      console.warn(
        `[SECURITY WARNING] SMTP credentials not configured in environment variables (SMTP_USER/SMTP_PASS). Server generated reset code for ${toEmail}: [${resetCode}]`
      );
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QuantumShield Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b1120; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" style="max-width: 560px; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 24px; color: #ffffff;">🛡️</span>
                  </td>
                  <td style="padding-left: 14px; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">QuantumShield</div>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">by Valmiki Softwares</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                Password Reset Verification Code
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom: 24px; text-align: center; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password for your QuantumShield account (<strong style="color: #60a5fa;">${toEmail}</strong>).
              Use the single-use 6-digit code below to set your new password.
            </td>
          </tr>

          <!-- Verification Code Box -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="background-color: #0f172a; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px 28px; display: inline-block;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">
                  ${resetCode}
                </span>
              </div>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 10px;">
                ⏱️ This verification code is valid for <strong>60 minutes</strong>.
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="background-color: #0f172a; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <strong style="color: #fbbf24;">Security Note:</strong> If you did not initiate this password reset request, please disregard this email. Your password will remain unchanged, and your account remains secure.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; border-top: 1px solid #334155; margin-top: 24px; color: #64748b; font-size: 11px;">
              © ${new Date().getFullYear()} Valmiki Softwares Private Limited. All rights reserved.<br>
              Post-Quantum Cryptography & Zero Code Execution Platform.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${resetCode} is your QuantumShield password reset code`,
        text: `Your QuantumShield password reset code is: ${resetCode}\n\nThis code will expire in 60 minutes.\n\nIf you did not request this, please ignore this email.\n\nValmiki Softwares`,
        html: htmlContent,
      });
      return true;
    } catch (error: any) {
      console.error('[EMAIL DISPATCH ERROR]', error);
      return false;
    }
  }
}

import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { transporter } from "@/lib/email/transporter";

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "noreply@yourdomain.com";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** A React Email component instance (created via React.createElement or JSX). */
  template: ReactElement;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a transactional email via Brevo SMTP using a React Email template.
 * Renders the React component to HTML before sending through Nodemailer.
 *
 * @param options - Recipient, subject, and React Email component
 * @returns Success status and Nodemailer message ID, or an error message
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { to, subject, template } = options;

  try {
    const html = await render(template);

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    console.log(
      `[EMAIL] Sent "${subject}" to ${Array.isArray(to) ? to.join(", ") : to} | messageId=${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[EMAIL] Failed to send email:", message);
    return { success: false, error: message };
  }
}

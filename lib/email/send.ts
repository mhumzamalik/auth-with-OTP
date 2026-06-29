import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { resend } from "@/lib/email/resend";

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "noreply@yourdomain.com";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: ReactElement;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a transactional email using Resend with a React Email template.
 * Renders the React component to HTML before sending.
 *
 * @param options - Recipient, subject, and React Email component
 * @returns Success status and email ID or error message
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { to, subject, template } = options;

  try {
    const html = await render(template);

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Sent "${subject}" to ${to} | id=${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[EMAIL] Failed to send email:", message);
    return { success: false, error: message };
  }
}

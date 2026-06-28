import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn(
    "[EMAIL] RESEND_API_KEY is not set. Emails will not be sent."
  );
}

/**
 * Singleton Resend client instance.
 * Used by send.ts to dispatch transactional emails.
 */
export const resend = new Resend(RESEND_API_KEY ?? "re_placeholder");

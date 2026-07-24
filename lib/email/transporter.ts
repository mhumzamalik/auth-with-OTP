import nodemailer from "nodemailer";

/**
 * Singleton Nodemailer transporter configured for Brevo SMTP relay.
 * Reuses one transporter across the application lifetime.
 */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// Verify the connection once in development to surface config errors early.
if (process.env.NODE_ENV === "development") {
  transporter.verify((error) => {
    if (error) {
      console.error("[EMAIL] SMTP connection failed:", error.message);
    } else {
      console.log("[EMAIL] SMTP transporter ready (Brevo)");
    }
  });
}

export { transporter };

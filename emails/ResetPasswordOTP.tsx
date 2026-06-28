import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface ResetPasswordOTPProps {
  otp: string;
  userName: string;
  appName?: string;
}

/**
 * React Email template for password reset OTP.
 * Includes security warning about not sharing the code.
 */
export default function ResetPasswordOTP({
  otp,
  userName,
  appName = "AuthApp",
}: ResetPasswordOTPProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your {appName} password reset code: {otp}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>{appName}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={heading}>Reset your password</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your {appName}{" "}
              account. Use the code below to proceed. This code expires in{" "}
              <strong>10 minutes</strong>.
            </Text>

            {/* OTP Display */}
            <Section style={otpContainer}>
              <Text style={otpLabel}>Your reset code</Text>
              <Text style={otpCode}>{otp.split("").join(" ")}</Text>
            </Section>

            {/* Warning */}
            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ <strong>Do not share this code with anyone.</strong>{" "}
                {appName} staff will never ask for your reset code.
              </Text>
            </Section>

            <Hr style={divider} />

            {/* Security Note */}
            <Text style={securityNote}>
              🔒 If you did not request a password reset, your account may be
              at risk. Please contact support immediately and do not use this
              code.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              This is an automated security email — please do not reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#FAE5D3",
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "20px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const header: React.CSSProperties = {
  backgroundColor: "#7B1F4B",
  padding: "24px 40px",
  textAlign: "center",
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: 0,
  letterSpacing: "-0.5px",
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const greeting: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  margin: "0 0 8px",
};

const heading: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#4B5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const otpContainer: React.CSSProperties = {
  backgroundColor: "#FDF2F8",
  borderRadius: "12px",
  border: "2px solid #F0ABBD",
  margin: "20px 0",
  padding: "20px",
  textAlign: "center",
};

const otpLabel: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.1em",
  margin: "0 0 8px",
  textTransform: "uppercase",
};

const otpCode: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "36px",
  fontWeight: "800",
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "12px",
  margin: 0,
};

const warningBox: React.CSSProperties = {
  backgroundColor: "#FEF3C7",
  borderRadius: "8px",
  border: "1px solid #FCD34D",
  margin: "16px 0",
  padding: "12px 16px",
};

const warningText: React.CSSProperties = {
  color: "#92400E",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const securityNote: React.CSSProperties = {
  backgroundColor: "#FEE2E2",
  borderRadius: "8px",
  border: "1px solid #FECACA",
  color: "#991B1B",
  fontSize: "13px",
  lineHeight: "1.5",
  padding: "12px 16px",
};

const footer: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderTop: "1px solid #E5E7EB",
  padding: "20px 40px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 4px",
};

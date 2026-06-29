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

interface VerificationOTPProps {
  otp: string;
  userName: string;
  appName?: string;
}


export default function VerificationOTP({
  otp,
  userName,
  appName = "AuthApp",
}: VerificationOTPProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your {appName} verification code: {otp}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{appName}</Text>
          </Section>
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={heading}>Verify your email address</Text>
            <Text style={paragraph}>
              Use the code below to verify your email address. This code
              expires in <strong>10 minutes</strong>.
            </Text>
            <Section style={otpContainer}>
              <Text style={otpCode}>{otp.split("").join(" ")}</Text>
            </Section>

            <Text style={paragraph}>
              Enter this 6-digit code on the verification page to activate
              your account.
            </Text>

            <Hr style={divider} />
            <Text style={securityNote}>
              🔒 If you did not create an account with {appName}, you can
              safely ignore this email. Do not share this code with anyone.
            </Text>
          </Section>

          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              This is an automated email — please do not reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}


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
  margin: "24px 0",
  padding: "20px",
  textAlign: "center",
};

const otpCode: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "36px",
  fontWeight: "800",
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "12px",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const securityNote: React.CSSProperties = {
  backgroundColor: "#FFF7ED",
  borderRadius: "8px",
  border: "1px solid #FED7AA",
  color: "#92400E",
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

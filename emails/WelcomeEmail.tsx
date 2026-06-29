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
  Link,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
  appName?: string;
  dashboardUrl?: string;
}

export default function WelcomeEmail({
  firstName,
  appName = "AuthApp",
  dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`,
}: WelcomeEmailProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to {appName}, {firstName}! Your account is ready.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{appName}</Text>
          </Section>
          <Section style={hero}>
            <Text style={heroEmoji}>🎉</Text>
            <Text style={heroHeading}>Welcome, {firstName}!</Text>
            <Text style={heroSubtext}>
              Your email has been verified and your account is ready to use.
            </Text>
          </Section>
          <Section style={content}>
            <Text style={sectionTitle}>Getting Started</Text>

            <Section style={stepItem}>
              <Text style={stepNumber}>01</Text>
              <Text style={stepText}>
                <strong>Complete your profile</strong> — Add your avatar and
                update your display name from the dashboard.
              </Text>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>02</Text>
              <Text style={stepText}>
                <strong>Secure your account</strong> — Review your active
                sessions and set up additional security from the Security tab.
              </Text>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>03</Text>
              <Text style={stepText}>
                <strong>Explore the platform</strong> — You now have full
                access to all features available to your account.
              </Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={ctaButton}>
                Go to Dashboard →
              </Link>
            </Section>

            <Hr style={divider} />

            <Text style={helpText}>
              Need help? Reply to this email or visit our support center. We
              typically respond within 24 hours.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this because you created an account. This is an
              automated message.
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

const hero: React.CSSProperties = {
  backgroundColor: "#FDF2F8",
  padding: "40px",
  textAlign: "center",
};

const heroEmoji: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const heroHeading: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const heroSubtext: React.CSSProperties = {
  color: "#6B7280",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "32px 40px 24px",
};

const sectionTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 24px",
};

const stepItem: React.CSSProperties = {
  display: "flex",
  marginBottom: "20px",
};

const stepNumber: React.CSSProperties = {
  color: "#7B1F4B",
  fontSize: "28px",
  fontWeight: "800",
  fontFamily: "monospace",
  marginRight: "16px",
  minWidth: "40px",
  lineHeight: "1.2",
};

const stepText: React.CSSProperties = {
  color: "#4B5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#7B1F4B",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const helpText: React.CSSProperties = {
  color: "#6B7280",
  fontSize: "14px",
  lineHeight: "1.6",
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

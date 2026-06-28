import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp";
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Secure Authentication`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Enterprise-grade authentication with multi-device session management, OTP verification, and token rotation.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Secure Authentication`,
    description:
      "Enterprise-grade authentication with multi-device session management.",
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} — Secure Authentication`,
  },
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactElement {
  return (
    <html
      lang="en" data-scroll-behavior="smooth"
      className={inter.variable}
      suppressHydrationWarning /* next-themes flips the class on mount */
    >
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

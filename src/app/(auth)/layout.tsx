import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | AuthApp",
  },
};

interface AuthGroupLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for all (auth) routes: /login, /register,
 * /verify-email, /forgot-password, /reset-password.
 *
 * Renders the two-panel AuthLayout (peach illustration + white form panel).
 */
export default function AuthGroupLayout({
  children,
}: AuthGroupLayoutProps): React.ReactElement {
  return <AuthLayout>{children}</AuthLayout>;
}

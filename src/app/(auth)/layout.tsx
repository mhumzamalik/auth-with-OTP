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

export default function AuthGroupLayout({
  children,
}: AuthGroupLayoutProps): React.ReactElement {
  return <AuthLayout>{children}</AuthLayout>;
}

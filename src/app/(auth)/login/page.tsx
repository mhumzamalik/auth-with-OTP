import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account to access your dashboard.",
};

/**
 * /login — Server Component page.
 * Renders the LoginForm inside the AuthLayout provided by (auth)/layout.tsx.
 */
export default function LoginPage(): React.ReactElement {
  return <LoginForm />;
}

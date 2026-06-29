import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account to access your dashboard.",
};

export default function LoginPage(): React.ReactElement {
  return <LoginForm />;
}

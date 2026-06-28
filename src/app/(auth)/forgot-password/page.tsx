import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your account password via email.",
};

export default function ForgotPasswordPage(): React.ReactElement {
  return <ForgotPasswordForm />;
}

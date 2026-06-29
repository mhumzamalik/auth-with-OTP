import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new account to get started.",
};

export default function RegisterPage(): React.ReactElement {
  return <RegisterForm />;
}

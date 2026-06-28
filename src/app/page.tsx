import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to /dashboard.
 * Middleware handles unauthenticated users → /login.
 */
export default function RootPage(): never {
  redirect("/dashboard");
}

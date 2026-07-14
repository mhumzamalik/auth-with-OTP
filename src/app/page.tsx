import { redirect } from "next/navigation";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export default async function RootPage(): Promise<never> {
  const token = await getAccessTokenFromCookies();
  let isAuthenticated = false;

  if (token) {
    try {
      verifyAccessToken(token);
      isAuthenticated = true;
    } catch {
      // Token is invalid or expired
    }
  }

  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}


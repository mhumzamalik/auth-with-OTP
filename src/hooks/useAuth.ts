"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}


export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const attemptRefresh = React.useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const fetchUser = React.useCallback(async (): Promise<void> => {
    try {
      let res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          res = await fetch("/api/auth/me", {
            credentials: "include",
            cache: "no-store",
          });
        }
      }

      if (!res.ok) {
        setUser(null);
        return;
      }

      const json = await res.json();
      setUser(json.data as AuthUser);
    } catch {
      setUser(null);
    }
  }, [attemptRefresh]);

  const refresh = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchUser();
    setIsLoading(false);
  }, [fetchUser]);

  const logout = React.useCallback(async (): Promise<void> => {
    setIsAuthenticating(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  }, [router]);

  React.useEffect(() => {
    void (async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    })();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    isAuthenticating,
    isAuthenticated: user !== null,
    refresh,
    logout,
  };
}

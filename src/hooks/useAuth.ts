"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** Shape of the authenticated user returned by GET /api/auth/me */
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
  /** The currently authenticated user, or null if unauthenticated. */
  user: AuthUser | null;
  /** True while the initial /me fetch is in-flight. */
  isLoading: boolean;
  /** True when any auth mutation (logout) is in-flight. */
  isAuthenticating: boolean;
  /** Whether a user is currently authenticated. */
  isAuthenticated: boolean;
  /** Re-fetches the user from /api/auth/me. */
  refresh: () => Promise<void>;
  /** Signs the user out and redirects to /login. */
  logout: () => Promise<void>;
}

/**
 * Primary authentication hook.
 *
 * Fetches the current user from GET /api/auth/me on mount.
 * Automatically attempts a token refresh via POST /api/auth/refresh
 * if /me returns 401 (expired access token).
 *
 * Usage:
 * ```tsx
 * const { user, isLoading, logout } = useAuth();
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  /** Attempts to silently refresh the access token. Returns true on success. */
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

  /** Fetches the current user profile from /api/auth/me. */
  const fetchUser = React.useCallback(async (): Promise<void> => {
    try {
      let res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      // Access token expired — try refresh once
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

  /** Public refresh — re-fetches user data and updates state. */
  const refresh = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchUser();
    setIsLoading(false);
  }, [fetchUser]);

  /** Signs out the current user and redirects to /login. */
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

  // Fetch user on mount
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

"use client";

import * as React from "react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface UseSessionReturn {
  /** The current user, null when unauthenticated or loading. */
  user: AuthUser | null;
  /** True while the initial user fetch is in-flight. */
  isLoading: boolean;
  /** True when a user is authenticated. */
  isAuthenticated: boolean;
  /** True if the user has the "admin" role. */
  isAdmin: boolean;
  /** Re-fetches session data from the server. */
  refresh: () => Promise<void>;
}

/**
 * Lightweight session hook that exposes the current user and
 * derived boolean flags. Delegates to useAuth internally.
 *
 * Use this hook when you only need read access to the current
 * session (e.g. showing the user's name in a nav bar).
 * Use useAuth() directly when you also need logout().
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isAdmin } = useSession();
 * ```
 */
export function useSession(): UseSessionReturn {
  const { user, isLoading, isAuthenticated, refresh } = useAuth();

  const isAdmin = React.useMemo(
    () => user?.role === "admin",
    [user?.role]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    refresh,
  };
}

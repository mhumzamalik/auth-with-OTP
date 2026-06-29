"use client";

import * as React from "react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface UseSessionReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}


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

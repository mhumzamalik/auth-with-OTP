"use client";

import * as React from "react";
import { toast } from "sonner";
import { type SessionData } from "@/components/dashboard/SessionCard";

interface UseSessionsReturn {
  /** All active sessions for the current user. */
  sessions: SessionData[];
  /** True while the initial fetch is in-flight. */
  isLoading: boolean;
  /** True while a revoke-all mutation is in-flight. */
  isRevokingAll: boolean;
  /** Re-fetches all sessions from the server. */
  refresh: () => Promise<void>;
  /** Revokes a single session by ID. Optimistically removes it from the list. */
  revokeSession: (sessionId: string) => Promise<void>;
  /** Revokes all sessions except the current one. */
  revokeAllOther: () => Promise<void>;
}

/**
 * Hook for managing multi-device session state on the security dashboard.
 *
 * Fetches from GET /api/auth/sessions on mount.
 * Exposes revokeSession and revokeAllOther mutations with
 * optimistic UI updates and sonner toast feedback.
 *
 * Usage:
 * ```tsx
 * const { sessions, isLoading, revokeSession, revokeAllOther } = useSessions();
 * ```
 */
export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = React.useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);

  /** Fetches the full session list from the API. */
  const fetchSessions = React.useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/sessions", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        toast.error("Failed to load sessions.");
        return;
      }

      const json = await res.json();
      setSessions(json.data ?? []);
    } catch {
      toast.error("Network error. Could not load sessions.");
    }
  }, []);

  /** Public refresh — shows loading state and re-fetches. */
  const refresh = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchSessions();
    setIsLoading(false);
  }, [fetchSessions]);

  /** Revokes a single session. Optimistically removes it from state. */
  const revokeSession = React.useCallback(
    async (sessionId: string): Promise<void> => {
      // Optimistic removal
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      try {
        const res = await fetch(`/api/auth/sessions?id=${sessionId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          // Rollback on failure
          await fetchSessions();
          toast.error(json.message ?? "Failed to revoke session.");
          return;
        }

        toast.success("Session revoked", {
          description: "That device has been signed out.",
        });
      } catch {
        // Rollback on network error
        await fetchSessions();
        toast.error("Network error. Please try again.");
      }
    },
    [fetchSessions]
  );

  /** Revokes all sessions except the current one. */
  const revokeAllOther = React.useCallback(async (): Promise<void> => {
    const otherCount = sessions.filter((s) => !s.isCurrent).length;

    if (otherCount === 0) {
      toast.info("No other active sessions to sign out.");
      return;
    }

    setIsRevokingAll(true);
    try {
      const res = await fetch("/api/auth/revoke-all", {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message ?? "Failed to sign out other devices.");
        return;
      }

      const count: number = json.data?.revokedCount ?? otherCount;
      toast.success(
        `Signed out of ${count} other device${count !== 1 ? "s" : ""}`,
        { description: "All other sessions have been revoked." }
      );

      // Keep only the current session
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsRevokingAll(false);
    }
  }, [sessions]);

  // Fetch sessions on mount
  React.useEffect(() => {
    void (async () => {
      setIsLoading(true);
      await fetchSessions();
      setIsLoading(false);
    })();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    isRevokingAll,
    refresh,
    revokeSession,
    revokeAllOther,
  };
}

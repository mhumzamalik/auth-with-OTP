"use client";

import * as React from "react";
import { toast } from "sonner";
import { type SessionData } from "@/components/dashboard/SessionCard";

interface UseSessionsReturn {
  sessions: SessionData[];
  isLoading: boolean;
  isRevokingAll: boolean;
  refresh: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllOther: () => Promise<void>;
}


export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = React.useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);

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

  const refresh = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchSessions();
    setIsLoading(false);
  }, [fetchSessions]);

  const revokeSession = React.useCallback(
    async (sessionId: string): Promise<void> => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      try {
        const res = await fetch(`/api/auth/sessions?id=${sessionId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          await fetchSessions();
          toast.error(json.message ?? "Failed to revoke session.");
          return;
        }

        toast.success("Session revoked", {
          description: "That device has been signed out.",
        });
      } catch {
        await fetchSessions();
        toast.error("Network error. Please try again.");
      }
    },
    [fetchSessions]
  );

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

      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsRevokingAll(false);
    }
  }, [sessions]);

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

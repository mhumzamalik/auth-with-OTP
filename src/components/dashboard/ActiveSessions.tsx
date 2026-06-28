"use client";

import * as React from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { SessionCard, type SessionData } from "@/components/dashboard/SessionCard";
import { SessionCardSkeleton } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ActiveSessionsProps {
  /** Initial sessions from server — avoids a client waterfall on first paint. */
  initialSessions?: SessionData[];
}

/**
 * Active sessions panel for the security dashboard.
 *
 * Fetches sessions from GET /api/auth/sessions on mount and after mutations.
 * Provides:
 * - Per-session revocation via DELETE /api/auth/sessions?id=…
 * - "Sign Out All Other Devices" via POST /api/auth/revoke-all
 * - Manual refresh button
 */
export function ActiveSessions({
  initialSessions,
}: ActiveSessionsProps): React.ReactElement {
  const [sessions, setSessions] = React.useState<SessionData[]>(
    initialSessions ?? []
  );
  const [isLoading, setIsLoading] = React.useState(!initialSessions);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);

  /** Fetches the latest session list from the API. */
  const fetchSessions = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/auth/sessions", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        toast.error("Failed to load sessions");
        return;
      }

      const json = await res.json();
      setSessions(json.data ?? []);
    } catch {
      toast.error("Network error. Could not load sessions.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load sessions on mount if no initialSessions provided
  React.useEffect(() => {
    if (!initialSessions) {
      void fetchSessions();
    }
  }, [fetchSessions, initialSessions]);

  /** Revokes a single session by ID. */
  const handleRevoke = React.useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`/api/auth/sessions?id=${sessionId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          toast.error(json.message ?? "Failed to revoke session");
          return;
        }

        toast.success("Session revoked", {
          description: "That device has been signed out.",
        });

        // Optimistically remove from list
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } catch {
        toast.error("Network error. Please try again.");
      }
    },
    []
  );

  /** Revokes all sessions except the current one. */
  const handleRevokeAll = React.useCallback(async () => {
    const otherSessions = sessions.filter((s) => !s.isCurrent);
    if (otherSessions.length === 0) {
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
        toast.error(json.message ?? "Failed to sign out other devices");
        return;
      }

      const count: number = json.data?.revokedCount ?? otherSessions.length;
      toast.success(`Signed out of ${count} other device${count !== 1 ? "s" : ""}`, {
        description: "All other sessions have been revoked.",
      });

      // Keep only the current session in the list
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsRevokingAll(false);
    }
  }, [sessions]);

  const otherSessionCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription className="mt-1">
              {sessions.length > 0
                ? `${sessions.length} active session${sessions.length !== 1 ? "s" : ""} across your devices`
                : "No active sessions found"}
            </CardDescription>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void fetchSessions(true)}
              disabled={isRefreshing || isLoading}
              aria-label="Refresh sessions"
              title="Refresh"
            >
              {isRefreshing ? (
                <LoadingSpinner size={16} />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {/* Sign out all other devices */}
            {otherSessionCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAll}
                disabled={isRevokingAll}
                aria-label={`Sign out all ${otherSessionCount} other device${otherSessionCount !== 1 ? "s" : ""}`}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                {isRevokingAll ? (
                  <>
                    <LoadingSpinner size={14} />
                    <span className="ml-1.5">Signing out…</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="ml-1.5">
                      Sign Out All Other Devices
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading skeleton */}
        {isLoading ? (
          <div
            className="space-y-3"
            role="status"
            aria-label="Loading sessions…"
          >
            <SessionCardSkeleton />
            <SessionCardSkeleton />
            <SessionCardSkeleton />
          </div>
        ) : sessions.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "#FAE5D3" }}
              aria-hidden="true"
            >
              <LogOut
                className="h-6 w-6"
                style={{ color: "#7B1F4B" }}
              />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No active sessions
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your active login sessions will appear here.
            </p>
          </div>
        ) : (
          /* Sessions list */
          <div
            role="list"
            aria-label="Active sessions"
            className="space-y-3"
          >
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

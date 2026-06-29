"use client";

import * as React from "react";
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getDeviceType } from "@/lib/utils/device";

export interface SessionData {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  lastActive: string | Date;
  expiresAt: string | Date;
  isCurrent: boolean;
  createdAt: string | Date;
}

interface SessionCardProps {
  session: SessionData;
  onRevoke: (sessionId: string) => Promise<void>;
}

function DeviceIcon({
  deviceName,
  className,
}: {
  deviceName: string;
  className?: string;
}): React.ReactElement {
  const type = getDeviceType(deviceName);
  if (type === "mobile") {
    return <Smartphone className={className} aria-hidden="true" />;
  }
  if (type === "tablet") {
    return <Tablet className={className} aria-hidden="true" />;
  }
  return <Monitor className={className} aria-hidden="true" />;
}


export function SessionCard({
  session,
  onRevoke,
}: SessionCardProps): React.ReactElement {
  const [isRevoking, setIsRevoking] = React.useState(false);

  const lastActiveText = React.useMemo(
    () =>
      formatDistanceToNow(new Date(session.lastActive), { addSuffix: true }),
    [session.lastActive]
  );

  const handleRevoke = React.useCallback(async () => {
    if (isRevoking || session.isCurrent) return;
    setIsRevoking(true);
    try {
      await onRevoke(session.id);
    } finally {
      setIsRevoking(false);
    }
  }, [isRevoking, session.id, session.isCurrent, onRevoke]);

  return (
    <div
      className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      role="listitem"
      aria-label={`Session: ${session.deviceName}${session.isCurrent ? " (current device)" : ""}`}
    >
      
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: session.isCurrent
            ? "rgba(123,31,75,0.1)"
            : "rgba(107,114,128,0.1)",
        }}
      >
        <DeviceIcon
          deviceName={session.deviceName}
          className="h-5 w-5"
          // @ts-expect-error — style prop handled inside component
          style={{ color: session.isCurrent ? "#7B1F4B" : "#6B7280" }}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
            {session.deviceName}
          </span>
          {session.isCurrent && (
            <Badge variant="success" className="shrink-0">
              <span
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Current Device
            </Badge>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {session.browser}
          {session.os ? ` · ${session.os}` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {session.ip}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <time dateTime={new Date(session.lastActive).toISOString()}>
              {lastActiveText}
            </time>
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRevoke}
        disabled={session.isCurrent || isRevoking}
        aria-label={
          session.isCurrent
            ? "Cannot revoke current session"
            : `Revoke session on ${session.deviceName}`
        }
        title={
          session.isCurrent
            ? "You cannot revoke your current session here"
            : "Sign out this device"
        }
        className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:text-gray-400 disabled:border-gray-200 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
      >
        {isRevoking ? (
          <LoadingSpinner size={14} label="Revoking…" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="ml-1.5 hidden sm:inline">
          {isRevoking ? "Revoking…" : "Revoke"}
        </span>
      </Button>
    </div>
  );
}

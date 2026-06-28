import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base skeleton block — a pulsing placeholder rectangle.
 * Compose multiples to match the shape of real content.
 */
export function Skeleton({ className, ...props }: SkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton layout for a single SessionCard in the dashboard.
 * Mirrors the real SessionCard structure: icon + text lines + button.
 */
export function SessionCardSkeleton(): React.ReactElement {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Device icon placeholder */}
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

      <div className="flex-1 space-y-2">
        {/* Device name + badge row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        {/* Browser + OS line */}
        <Skeleton className="h-3 w-48" />
        {/* IP + last active line */}
        <Skeleton className="h-3 w-36" />
      </div>

      {/* Revoke button placeholder */}
      <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
    </div>
  );
}

/**
 * Skeleton layout for the dashboard profile header.
 * Mirrors: avatar + name + email + role badge.
 */
export function ProfileSkeleton(): React.ReactElement {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

      <div className="space-y-2">
        {/* Full name */}
        <Skeleton className="h-5 w-40" />
        {/* Email */}
        <Skeleton className="h-4 w-56" />
        {/* Role badge */}
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton layout for the full dashboard page.
 * Renders a ProfileSkeleton + three SessionCardSkeletons.
 */
export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard…">
      {/* Profile section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="mb-4 h-5 w-32" />
        <ProfileSkeleton />
      </div>

      {/* Sessions section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="space-y-3">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      </div>
    </div>
  );
}

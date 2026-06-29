import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

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

export function SessionCardSkeleton(): React.ReactElement {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>

      <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
    </div>
  );
}

export function ProfileSkeleton(): React.ReactElement {
  return (
    <div className="flex items-center gap-4">
      
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

      <div className="space-y-2">
        
        <Skeleton className="h-5 w-40" />
        
        <Skeleton className="h-4 w-56" />
        
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}


export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard…">
      
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="mb-4 h-5 w-32" />
        <ProfileSkeleton />
      </div>

      
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

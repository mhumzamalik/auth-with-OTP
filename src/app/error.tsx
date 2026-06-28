"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary.
 * Displayed by Next.js when an unhandled error is thrown
 * in a Server or Client Component below this boundary.
 */
export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.ReactElement {
  React.useEffect(() => {
    // Log to console in development; swap for Sentry/Datadog in production
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 dark:bg-gray-950">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "#FAE5D3" }}
          aria-hidden="true"
        >
          <AlertTriangle className="h-8 w-8" style={{ color: "#7B1F4B" }} />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Error ID:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                {error.digest}
              </code>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="gap-2"
            id="error-retry-btn"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>

          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Size of the spinner in pixels. Defaults to 20. */
  size?: number;
  /** Additional class names for the wrapper span. */
  className?: string;
  /** Accessible label for screen readers. Defaults to "Loading…" */
  label?: string;
}

/**
 * Lightweight SVG-based loading spinner.
 * Uses CSS animation only — no JS required after mount.
 * Respects `prefers-reduced-motion` via Tailwind's `motion-safe:` variant.
 */
export function LoadingSpinner({
  size = 20,
  className,
  label = "Loading…",
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-safe:animate-spin"
        aria-hidden="true"
      >
        <path
          d="M12 2a10 10 0 1 0 10 10"
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={2.5}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth={2.5}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

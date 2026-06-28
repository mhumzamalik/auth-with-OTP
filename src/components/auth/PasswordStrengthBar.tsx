"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/auth/password";

interface PasswordStrengthBarProps {
  /** The current password value to evaluate. */
  password: string;
  /** Additional class names for the wrapper. */
  className?: string;
}

/** Maps strength score (0–4) to display metadata. */
const STRENGTH_CONFIG = [
  { label: "Too weak",  color: "bg-red-500",    width: "w-1/4"  },
  { label: "Weak",      color: "bg-orange-500",  width: "w-2/4"  },
  { label: "Fair",      color: "bg-yellow-500",  width: "w-2/4"  },
  { label: "Strong",    color: "bg-emerald-500", width: "w-3/4"  },
  { label: "Very strong", color: "bg-emerald-600", width: "w-full" },
] as const;

/**
 * Visual password strength indicator used on register and reset-password forms.
 * Displays a coloured progress bar and a strength label.
 * Hidden from screen when password is empty.
 */
export function PasswordStrengthBar({
  password,
  className,
}: PasswordStrengthBarProps): React.ReactElement | null {
  if (!password) return null;

  const score = getPasswordStrength(password); // 0–4
  const config = STRENGTH_CONFIG[score];

  return (
    <div
      className={cn("space-y-1.5", className)}
      role="status"
      aria-label={`Password strength: ${config.label}`}
      aria-live="polite"
    >
      {/* Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {/* Fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            config.color,
            config.width
          )}
        />
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-medium transition-colors duration-300",
            score <= 1 && "text-red-600 dark:text-red-400",
            score === 2 && "text-yellow-600 dark:text-yellow-400",
            score >= 3 && "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {config.label}
        </p>

        {/* Dot indicators */}
        <div className="flex gap-1" aria-hidden="true">
          {STRENGTH_CONFIG.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-4 rounded-full transition-all duration-300",
                i <= score
                  ? score <= 1
                    ? "bg-red-500"
                    : score === 2
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

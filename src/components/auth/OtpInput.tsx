"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** Called with the full 6-digit string whenever all boxes are filled. */
  onComplete: (otp: string) => void;
  /** Called on every keystroke with the current partial value. */
  onChange?: (otp: string) => void;
  /** Disables all inputs (e.g. during submission). */
  disabled?: boolean;
  /** Shows error styling on all boxes. */
  hasError?: boolean;
  /** Number of OTP digits. Defaults to 6. */
  length?: number;
  /** Additional class names for the wrapper div. */
  className?: string;
}

/**
 * 6-box OTP input with:
 * - Auto-focus next box on digit entry
 * - Backspace moves focus to previous box
 * - Paste support: splits pasted string across all boxes
 * - Numeric-only input
 * - Error state styling
 * - Full keyboard and screen-reader accessibility
 */
export function OtpInput({
  onComplete,
  onChange,
  disabled = false,
  hasError = false,
  length = 6,
  className,
}: OtpInputProps): React.ReactElement {
  const [values, setValues] = React.useState<string[]>(
    Array(length).fill("")
  );
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>(
    Array(length).fill(null)
  );

  /** Focuses the input at the given index, clamped to valid range. */
  const focusAt = React.useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[clamped]?.focus();
  }, [length]);

  /** Notifies parent of current joined value. */
  const notify = React.useCallback(
    (next: string[]) => {
      const joined = next.join("");
      onChange?.(joined);
      if (joined.length === length) {
        onComplete(joined);
      }
    },
    [length, onChange, onComplete]
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const raw = e.target.value;
      // Accept only the last typed digit (handles autofill with multiple chars)
      const digit = raw.replace(/\D/g, "").slice(-1);

      setValues((prev) => {
        const next = [...prev];
        next[index] = digit;
        notify(next);
        return next;
      });

      if (digit) {
        focusAt(index + 1);
      }
    },
    [focusAt, notify]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        setValues((prev) => {
          const next = [...prev];
          if (next[index]) {
            // Clear current box
            next[index] = "";
            notify(next);
            return next;
          }
          // Current box already empty — clear previous and move back
          if (index > 0) {
            next[index - 1] = "";
            notify(next);
            focusAt(index - 1);
          }
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusAt(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusAt(index + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusAt(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusAt(length - 1);
      }
    },
    [focusAt, length, notify]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);

      if (!pasted) return;

      setValues((prev) => {
        const next = [...prev];
        // Fill from the pasted index onwards
        pasted.split("").forEach((char, i) => {
          if (index + i < length) {
            next[index + i] = char;
          }
        });
        notify(next);
        // Focus the box after the last pasted digit
        focusAt(Math.min(index + pasted.length, length - 1));
        return next;
      });
    },
    [focusAt, length, notify]
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Select the digit on focus so retyping replaces it naturally
      e.target.select();
    },
    []
  );

  // Focus the first empty box (or last box) on initial mount
  React.useEffect(() => {
    focusAt(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="group"
      aria-label="One-time password input"
      className={cn("flex items-center gap-2 sm:gap-3", className)}
    >
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={val}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          onFocus={handleFocus}
          className={cn(
            // Base — square box
            "h-12 w-12 rounded-xl border-2 bg-white text-center text-xl font-bold text-gray-900 outline-none",
            "transition-all duration-200",
            // Placeholder styling
            "placeholder:text-gray-300",
            // Focus
            "focus:border-burgundy focus:ring-2 focus:ring-burgundy/20",
            // Filled
            val && !hasError && "border-burgundy/50 bg-burgundy/5",
            // Error state
            hasError
              ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200 dark:bg-red-900/20 dark:text-red-400"
              : "border-gray-200",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Dark mode
            "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            val && !hasError && "dark:border-burgundy/60 dark:bg-burgundy/10"
          )}
        />
      ))}
    </div>
  );
}

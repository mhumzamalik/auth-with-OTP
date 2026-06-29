"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  length?: number;
  className?: string;
}


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

  const focusAt = React.useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[clamped]?.focus();
  }, [length]);

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
            next[index] = "";
            notify(next);
            return next;
          }
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
        pasted.split("").forEach((char, i) => {
          if (index + i < length) {
            next[index + i] = char;
          }
        });
        notify(next);
        focusAt(Math.min(index + pasted.length, length - 1));
        return next;
      });
    },
    [focusAt, length, notify]
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    },
    []
  );

  React.useEffect(() => {
    focusAt(0);
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
            "h-12 w-12 rounded-xl border-2 bg-white text-center text-xl font-bold text-gray-900 outline-none",
            "transition-all duration-200",

            "placeholder:text-gray-300",
            
            "focus:border-burgundy focus:ring-2 focus:ring-burgundy/20",
            
            val && !hasError && "border-burgundy/50 bg-burgundy/5",
            
            hasError
              ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200 dark:bg-red-900/20 dark:text-red-400"
              : "border-gray-200",
            
            "disabled:cursor-not-allowed disabled:opacity-50",
            
            "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            val && !hasError && "dark:border-burgundy/60 dark:bg-burgundy/10"
          )}
        />
      ))}
    </div>
  );
}

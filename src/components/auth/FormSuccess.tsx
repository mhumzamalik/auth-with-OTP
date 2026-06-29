import * as React from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSuccessProps {
  
  message?: string | null;
  
  className?: string;
}


export function FormSuccess({
  message,
  className,
}: FormSuccessProps): React.ReactElement | null {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700",
        "dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
        className
      )}
    >
      <CheckCircle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-burgundy/10 text-burgundy border border-burgundy/20 focus:ring-burgundy dark:bg-burgundy/20 dark:text-rose-300",
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-200 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 focus:ring-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        destructive:
          "bg-red-50 text-red-700 border border-red-200 focus:ring-red-400 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 focus:ring-amber-400 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        outline:
          "border border-gray-200 text-gray-700 focus:ring-gray-400 dark:border-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for status labels, tags, and indicators.
 * Used in SessionCard for "Current Device" and role labels on the dashboard.
 */
function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps): React.ReactElement {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = React.useCallback(() => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }, [theme, setTheme]);

  const label = !mounted
    ? "Toggle theme"
    : theme === "light"
      ? "Switch to dark mode"
      : theme === "dark"
        ? "Switch to system theme"
        : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200",
        "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2",
        "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        className
      )}
    >
      {!mounted ? (
        <Monitor className="h-4 w-4" aria-hidden="true" />
      ) : theme === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Monitor className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

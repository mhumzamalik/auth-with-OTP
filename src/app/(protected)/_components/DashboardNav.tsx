"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const NAV_LINKS = [
  { href: "/dashboard",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/security", label: "Security",  icon: Shield          },
] as const;

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}


export function DashboardNav(): React.ReactElement {
  const pathname = usePathname();
  const { user, isLoading, logout, isAuthenticating } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const initials = user ? getInitials(user.fullName) : "?";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
          aria-label="AuthApp dashboard home"
        >
          <div className="grid grid-cols-2 gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: "#7B1F4B" }}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp"}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy",
                  isActive
                    ? "bg-burgundy/10 text-burgundy dark:bg-burgundy/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading && user && (
            <div className="hidden items-center gap-3 md:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">
                  {user.fullName}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-none">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void logout()}
            disabled={isAuthenticating}
            aria-label="Sign out"
            className="hidden gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 md:flex"
          >
            {isAuthenticating ? (
              <LoadingSpinner size={14} />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Sign out</span>
          </Button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 dark:border-gray-800 dark:bg-gray-950 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-burgundy/10 text-burgundy"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                void logout();
              }}
              disabled={isAuthenticating}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

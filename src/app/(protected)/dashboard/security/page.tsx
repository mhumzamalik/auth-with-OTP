"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { ActiveSessions } from "@/components/dashboard/ActiveSessions";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/dashboard/DeleteAccountDialog";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

/**
 * /dashboard/security — Security settings page.
 *
 * Sections:
 * 1. Active Sessions — view and revoke all devices
 * 2. Change Password — update password with strength feedback
 * 3. Danger Zone — permanent account deletion
 */
export default function SecurityPage(): React.ReactElement {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <DashboardSkeleton />;
  if (!user) return <></>;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Security Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your password, active sessions, and account security.
        </p>
      </div>

      {/* ── Section 1: Active Sessions ──────────────────────────────────── */}
      <section aria-labelledby="sessions-heading">
        <h2
          id="sessions-heading"
          className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Active Sessions
        </h2>
        <ActiveSessions />
      </section>

      <Separator />

      {/* ── Section 2: Change Password ──────────────────────────────────── */}
      <section aria-labelledby="password-heading">
        <h2
          id="password-heading"
          className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Change Password
        </h2>
        <ChangePasswordForm />
      </section>

      <Separator />

      {/* ── Section 3: Danger Zone ──────────────────────────────────────── */}
      <section aria-labelledby="danger-heading">
        <h2
          id="danger-heading"
          className="mb-4 text-lg font-semibold text-red-700 dark:text-red-400"
        >
          Danger Zone
        </h2>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30"
                aria-hidden="true"
              >
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-base text-red-700 dark:text-red-400">
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data.
                  This action cannot be undone.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/10">
              {/* Warning list */}
              <ul className="space-y-1.5 text-sm text-red-700 dark:text-red-400">
                {[
                  "Your profile and personal data will be permanently deleted",
                  "All active sessions will be revoked immediately",
                  "You will lose access to all features and data",
                  "This action is irreversible — there is no recovery option",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Trash2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <DeleteAccountDialog userEmail={user.email} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

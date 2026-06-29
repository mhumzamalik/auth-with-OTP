"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useSessions } from "@/hooks/useSessions";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function DashboardPage(): React.ReactElement {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();
  const { sessions, isLoading: isSessionsLoading } = useSessions();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) return <></>;

  const currentSession = sessions.find((s) => s.isCurrent);
  const lastActiveText = currentSession
    ? new Date(currentSession.lastActive).toLocaleString()
    : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user.fullName.split(" ")[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserProfile
            user={{
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              isVerified: user.isVerified,
              createdAt: user.createdAt,
            }}
          />
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#FAE5D3" }}
                aria-hidden="true"
              >
                <Activity
                  className="h-5 w-5"
                  style={{ color: "#7B1F4B" }}
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isSessionsLoading ? "—" : sessions.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#FAE5D3" }}
                aria-hidden="true"
              >
                <Shield
                  className="h-5 w-5"
                  style={{ color: "#7B1F4B" }}
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Account Status
                </p>
                <div className="mt-0.5">
                  <Badge variant={user.isVerified ? "success" : "warning"}>
                    {user.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#FAE5D3" }}
                aria-hidden="true"
              >
                <Clock
                  className="h-5 w-5"
                  style={{ color: "#7B1F4B" }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Last Active
                </p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {lastActiveText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-burgundy/20 bg-gradient-to-r from-burgundy/5 to-transparent dark:from-burgundy/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#FAE5D3" }}
                aria-hidden="true"
              >
                <Shield className="h-5 w-5" style={{ color: "#7B1F4B" }} />
              </div>
              <div>
                <CardTitle className="text-base">Security Settings</CardTitle>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  Manage your password, active sessions, and account security.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
              <Link href="/dashboard/security">
                Manage
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

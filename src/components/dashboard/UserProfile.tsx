"use client";

import * as React from "react";
import { Camera, Mail, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** User data shape expected by this component */
export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  isVerified: boolean;
  createdAt: string | Date;
}

interface UserProfileProps {
  user: UserProfileData;
}

/**
 * Returns up to 2 uppercase initials from a full name.
 * "Jane Doe" → "JD", "Alice" → "A"
 */
function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Dashboard profile card.
 * Displays: avatar (with initials fallback), full name, email,
 * role badge, verified badge, and member-since date.
 */
export function UserProfile({ user }: UserProfileProps): React.ReactElement {
  const initials = getInitials(user.fullName);
  const memberSince = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar + name row */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar with upload hint */}
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-md dark:ring-gray-900">
              <AvatarImage
                src={user.avatar}
                alt={`${user.fullName}'s avatar`}
              />
              <AvatarFallback className="text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Camera icon overlay — visual hint that avatar is uploadable */}
            <div
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 shadow-sm transition-colors hover:bg-gray-200 dark:border-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
              aria-label="Change avatar"
              title="Change avatar (coming soon)"
            >
              <Camera className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.fullName}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role badge */}
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
              >
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>

              {/* Verified badge */}
              {user.isVerified && (
                <Badge variant="success">
                  <Shield className="mr-1 h-3 w-3" aria-hidden="true" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Email
              </p>
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Member since
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {memberSince}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

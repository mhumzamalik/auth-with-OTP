"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/constants";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


export function ChangePasswordForm(): React.ReactElement {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const watchedNewPassword = watch("newPassword");

  const onSubmit = React.useCallback(
    async (data: ChangePasswordInput) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setServerError(json.message ?? "Failed to update password. Please try again.");
          return;
        }

        setSuccessMessage("Password updated successfully.");
        toast.success("Password changed", {
          description: "Your password has been updated.",
        });

        reset();
      } catch {
        setServerError("A network error occurred. Please try again.");
      }
    },
    [reset]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#FAE5D3" }}
            aria-hidden="true"
          >
            <KeyRound className="h-4 w-4" style={{ color: "#7B1F4B" }} />
          </div>
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription className="mt-0.5">
              Update your password to keep your account secure
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FormError message={serverError} />
        <FormSuccess message={successMessage} className="mb-4" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
          aria-label="Change password form"
        >
          
          <div className="space-y-1.5">
            <Label htmlFor="change-current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="change-current-password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.currentPassword}
                aria-describedby={
                  errors.currentPassword
                    ? "change-current-password-error"
                    : undefined
                }
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p
                id="change-current-password-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="change-new-password">New Password</Label>
            <div className="relative">
              <Input
                id="change-new-password"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "change-new-password-error" : undefined
                }
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <PasswordStrengthBar password={watchedNewPassword} />

            {errors.newPassword && (
              <p
                id="change-new-password-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.newPassword.message}
              </p>
            )}
          </div>

          
          <div className="space-y-1.5">
            <Label htmlFor="change-confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="change-confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.confirmNewPassword}
                aria-describedby={
                  errors.confirmNewPassword
                    ? "change-confirm-password-error"
                    : undefined
                }
                {...register("confirmNewPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p
                id="change-confirm-password-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              id="change-password-submit-btn"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={14} label="Updating password…" />
                  <span className="ml-2">Updating…</span>
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

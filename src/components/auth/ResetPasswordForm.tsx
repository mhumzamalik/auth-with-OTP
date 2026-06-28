"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/**
 * Reset password form.
 * Reads userId from the URL query param set by ForgotPasswordForm.
 *
 * Flow:
 * 1. User enters the 6-digit OTP from their email
 * 2. User enters a new password + confirmation
 * 3. POST /api/auth/reset-password — verifies OTP + updates password
 * 4. On success: shows message then redirects to /login
 */
export function ResetPasswordForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [otpHasError, setOtpHasError] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      userId,
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password");

  // Keep the hidden userId field in sync if query param loads after mount
  React.useEffect(() => {
    if (userId) setValue("userId", userId);
  }, [userId, setValue]);

  const handleOtpComplete = React.useCallback(
    (otp: string) => {
      setValue("otp", otp, { shouldValidate: true });
      setOtpHasError(false);
    },
    [setValue]
  );

  const handleOtpChange = React.useCallback(
    (otp: string) => {
      setValue("otp", otp);
      if (otpHasError && otp.length < 6) setOtpHasError(false);
    },
    [setValue, otpHasError]
  );

  const onSubmit = React.useCallback(
    async (data: ResetPasswordInput) => {
      setServerError(null);
      setSuccessMessage(null);
      setOtpHasError(false);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          if (json.code === "INVALID_OTP") {
            setOtpHasError(true);
          }
          setServerError(json.message ?? "Failed to reset password. Please try again.");
          return;
        }

        setSuccessMessage(
          "Password updated successfully. Redirecting you to login…"
        );

        toast.success("Password reset!", {
          description: "You can now sign in with your new password.",
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch {
        setServerError("A network error occurred. Please try again.");
      }
    },
    [router]
  );

  // Guard: no userId means the user landed here directly without going through forgot-password
  if (!userId) {
    return (
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reset Password
        </h1>
        <FormError message="Invalid or missing reset session. Please request a new password reset." />
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
          style={{ color: "#7B1F4B" }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Request a reset code
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded dark:text-gray-400 dark:hover:text-gray-100"
        aria-label="Back to forgot password"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      {/* Heading */}
      <div className="space-y-1">
        <div className="mb-2 grid grid-cols-2 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: "#7B1F4B" }}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Reset your password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the 6-digit code from your email and choose a new password.
        </p>
      </div>

      {/* Feedback */}
      <FormError message={serverError} />
      <FormSuccess message={successMessage} />

      {!successMessage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
          aria-label="Reset password form"
        >
          {/* Hidden userId field */}
          <input type="hidden" {...register("userId")} />

          {/* OTP input */}
          <div className="space-y-2">
            <Label htmlFor="otp-0">Verification Code</Label>
            <OtpInput
              onComplete={handleOtpComplete}
              onChange={handleOtpChange}
              hasError={otpHasError || !!errors.otp}
              disabled={isSubmitting}
            />
            {errors.otp && (
              <p
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.otp.message}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Didn&apos;t receive a code?{" "}
              <Link
                href={`/forgot-password`}
                className="font-medium hover:underline"
                style={{ color: "#7B1F4B" }}
              >
                Request a new one
              </Link>
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">New Password</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "reset-password-error" : undefined
                }
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <PasswordStrengthBar password={watchedPassword} />

            {errors.password && (
              <p
                id="reset-password-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="reset-confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "reset-confirm-error"
                    : undefined
                }
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="reset-confirm-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            id="reset-password-submit-btn"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size={16} label="Resetting password…" />
                <span>Resetting password…</span>
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
          style={{ color: "#7B1F4B" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/**
 * Forgot password form.
 * Accepts an email address and calls POST /api/auth/forgot-password.
 *
 * The API always returns the same safe message regardless of whether
 * the email is registered — this form mirrors that behaviour in the UI
 * (always shows a success state after submission to prevent enumeration).
 *
 * On success: shows success message + stores userId in sessionStorage
 * then navigates to /reset-password?userId=…
 */
export function ForgotPasswordForm(): React.ReactElement {
  const router = useRouter();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = React.useCallback(
    async (data: ForgotPasswordInput) => {
      setServerError(null);
      setSuccessMessage(null);

      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const json = await res.json();

        // API always returns success message (anti-enumeration)
        // Even rate-limited responses return the same message
        if (!res.ok && res.status !== 429) {
          setServerError(
            json.message ?? "Something went wrong. Please try again."
          );
          return;
        }

        setSuccessMessage(
          json.message ??
            "If this email is registered, you will receive a reset code."
        );

        // If API returned a userId (email was found), navigate to reset page
        if (json.data?.userId) {
          setTimeout(() => {
            router.push(`/reset-password?userId=${json.data.userId}`);
          }, 2000);
        }
      } catch {
        setServerError("A network error occurred. Please try again.");
      }
    },
    [router]
  );

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded dark:text-gray-400 dark:hover:text-gray-100"
        aria-label="Back to login"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to login
      </Link>

      {/* Heading */}
      <div className="space-y-1">
        {/* Icon */}
        <div
          className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "#FAE5D3" }}
          aria-hidden="true"
        >
          <Mail className="h-6 w-6" style={{ color: "#7B1F4B" }} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No worries. Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      {/* Feedback */}
      <FormError message={serverError} />
      <FormSuccess message={successMessage} />

      {/* Form — hidden after success to prevent duplicate submissions */}
      {!successMessage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
          aria-label="Forgot password form"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email address</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "forgot-email-error" : undefined
              }
              {...register("email")}
            />
            {errors.email && (
              <p
                id="forgot-email-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            id="forgot-password-submit-btn"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size={16} label="Sending reset code…" />
                <span>Sending…</span>
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      )}

      {/* Success state — show redirect hint */}
      {successMessage && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Redirecting you to the reset page…{" "}
          <Link
            href="/login"
            className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
            style={{ color: "#7B1F4B" }}
          >
            Or go back to login
          </Link>
        </p>
      )}

      {/* Bottom nav */}
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

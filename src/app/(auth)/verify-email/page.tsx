"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { OtpInput } from "@/components/auth/OtpInput";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const dynamic = "force-dynamic";

const RESEND_COOLDOWN_SEC = 60;

/**
 * /verify-email — OTP verification page.
 *
 * Reads userId from ?userId= query param (set by /register or /login).
 * Auto-submits when the 6th digit is entered.
 * Includes a resend OTP button with a 60-second cooldown.
 */
export default function VerifyEmailPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [otp, setOtp] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [otpHasError, setOtpHasError] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = React.useCallback(
    async (code: string) => {
      if (!userId) return;
      setServerError(null);
      setOtpHasError(false);
      setIsVerifying(true);

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: code, userId, type: "email-verification" }),
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setOtpHasError(true);
          setServerError(json.message ?? "Invalid verification code. Please try again.");
          return;
        }

        setSuccessMessage("Email verified! Redirecting to your dashboard…");
        toast.success("Email verified!", {
          description: "Welcome aboard! Your account is ready.",
        });

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } catch {
        setServerError("A network error occurred. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    },
    [userId, router]
  );

  const handleOtpComplete = React.useCallback(
    (code: string) => {
      setOtp(code);
      void handleVerify(code);
    },
    [handleVerify]
  );

  const handleResend = React.useCallback(async () => {
    if (!userId || cooldown > 0) return;
    setServerError(null);
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "email-verification" }),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.message ?? "Failed to resend code. Please try again.");
        return;
      }

      toast.success("Code resent!", {
        description: "Check your inbox for a new verification code.",
      });
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [userId, cooldown]);

  // Guard: no userId
  if (!userId) {
    return (
      <div className="w-full space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Verify Email
        </h1>
        <FormError message="Missing session. Please register or log in again." />
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "#7B1F4B" }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to register
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to login
      </Link>

      {/* Heading */}
      <div className="space-y-1">
        <div
          className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "#FAE5D3" }}
          aria-hidden="true"
        >
          <Mail className="h-6 w-6" style={{ color: "#7B1F4B" }} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Verify your email
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We sent a 6-digit code to your email address. Enter it below to
          confirm your account.
        </p>
      </div>

      {/* Feedback */}
      <FormError message={serverError} />
      <FormSuccess message={successMessage} />

      {!successMessage && (
        <div className="space-y-6">
          {/* OTP boxes */}
          <div className="space-y-3">
            <OtpInput
              onComplete={handleOtpComplete}
              onChange={(val) => {
                setOtp(val);
                if (otpHasError) setOtpHasError(false);
              }}
              hasError={otpHasError}
              disabled={isVerifying}
            />

            {/* Manual verify button (for keyboard users who tabbed away) */}
            <Button
              id="verify-email-btn"
              onClick={() => void handleVerify(otp)}
              disabled={otp.length < 6 || isVerifying}
              className="w-full"
              size="lg"
              aria-busy={isVerifying}
            >
              {isVerifying ? (
                <>
                  <LoadingSpinner size={16} label="Verifying…" />
                  <span className="ml-2">Verifying…</span>
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                id="resend-otp-btn"
                onClick={() => void handleResend()}
                disabled={isResending || cooldown > 0}
                className="font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "#7B1F4B" }}
                aria-label={
                  cooldown > 0
                    ? `Resend available in ${cooldown} seconds`
                    : "Resend verification code"
                }
              >
                {isResending ? (
                  "Sending…"
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  "Resend code"
                )}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

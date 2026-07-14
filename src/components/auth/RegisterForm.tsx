"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function RegisterForm(): React.ReactElement {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password");

  const onSubmit = React.useCallback(async (data: RegisterInput) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.message ?? "Registration failed. Please try again.");
        return;
      }

      const userId: string = json.data?.userId ?? "";
      setSuccessMessage(
        "Account created! Check your email for the 6-digit verification code."
      );

      toast.success("Account created!", {
        description: "A verification code has been sent to your email.",
      });

      setTimeout(() => {
        router.push(`/verify-email?userId=${userId}`);
      }, 1500);
    } catch {
      setServerError("A network error occurred. Please try again.");
    }
  }, [router]);

  const handleGoogleSignUp = React.useCallback(() => {
    setIsGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }, []);

  return (
    <div className="w-full space-y-6">

      <div className="flex flex-col items-center gap-1 text-center">
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
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Join us today — it&apos;s free
        </p>
      </div>


      <GoogleButton
        id="google-register-btn"
        label="Sign up with Google"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-400 whitespace-nowrap dark:text-gray-500">
          or register with Email
        </span>
        <Separator className="flex-1" />
      </div>

      <FormError message={serverError} />
      <FormSuccess message={successMessage} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        aria-label="Registration form"
      >
 
        <div className="space-y-1.5">
          <Label htmlFor="register-fullname">Full Name</Label>
          <Input
            id="register-fullname"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={!!errors.fullName}
            aria-describedby={
              errors.fullName ? "register-fullname-error" : undefined
            }
            {...register("fullName")}
          />
          {errors.fullName && (
            <p
              id="register-fullname-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? "register-email-error" : undefined
            }
            {...register("email")}
          />
          {errors.email && (
            <p
              id="register-email-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        
        <div className="space-y-1.5">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
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
              id="register-password-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirm-error"
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
              id="register-confirm-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          id="register-submit-btn"
          disabled={isSubmitting || !!successMessage}
          className="w-full"
          size="lg"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size={16} label="Creating account…" />
              <span>Creating account…</span>
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

     
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
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

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/lib/validations/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/auth/FormError";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = React.useCallback(
    async (data: LoginInput) => {
      setServerError(null);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          if (json.code === "ACCOUNT_LOCKED" && json.errors?.lockUntil) {
            const remaining = Math.ceil(
              (new Date(json.errors.lockUntil).getTime() - Date.now()) / 60000
            );
            setServerError(
              `Account locked. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`
            );
          } else if (json.code === "EMAIL_NOT_VERIFIED") {
            setServerError(json.message);
            if (json.data?.userId) {
              router.push(`/verify-email?userId=${json.data.userId}`);
            }
          } else {
            setServerError(json.message ?? "Login failed. Please try again.");
          }
          return;
        }

        toast.success("Welcome back!", {
          description: `Logged in as ${json.data?.user?.email ?? ""}`,
        });

        router.push(callbackUrl);
        router.refresh();
      } catch {
        setServerError("A network error occurred. Please try again.");
      }
    },
    [callbackUrl, router]
  );

  const handleGoogleLogin = React.useCallback(() => {
    setIsGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <div
          className="mb-2 grid grid-cols-2 gap-1"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: "#7B1F4B" }}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Login to your Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          See what is going on with your business
        </p>
      </div>

      <GoogleButton
        id="google-login-btn"
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-400 whitespace-nowrap dark:text-gray-500">
          or login with Email
        </span>
        <Separator className="flex-1" />
      </div>

      <FormError message={serverError} />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        aria-label="Login form"
      >
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="login-email-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
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
          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked === true)
              }
            />
            <Label
              htmlFor="remember-me"
              className="cursor-pointer text-sm font-normal text-gray-600 dark:text-gray-400"
            >
              Remember me
            </Label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
            style={{ color: "#7B1F4B" }}
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          id="login-submit-btn"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size={16} label="Signing in…" />
              <span>Signing in…</span>
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Not Registered Yet?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded"
          style={{ color: "#7B1F4B" }}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

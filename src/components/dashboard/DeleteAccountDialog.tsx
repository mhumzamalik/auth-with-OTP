"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/auth/FormError";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/** The user must type this exact phrase to confirm deletion */
const CONFIRM_PHRASE = "delete my account";

const deleteAccountSchema = z.object({
  confirmText: z
    .string()
    .refine((val) => val === CONFIRM_PHRASE, {
      message: `Please type "${CONFIRM_PHRASE}" to confirm`,
    }),
  password: z.string().min(1, "Password is required to confirm deletion"),
});

type DeleteAccountInput = z.input<typeof deleteAccountSchema>;

interface DeleteAccountDialogProps {
  /** The user's email shown in the warning message */
  userEmail: string;
}

/**
 * Dangerous-action dialog for permanent account deletion.
 *
 * Requires the user to:
 * 1. Type "delete my account" exactly
 * 2. Enter their current password
 *
 * On confirmation: calls DELETE /api/auth/account,
 * clears cookies server-side, then redirects to /login.
 */
export function DeleteAccountDialog({
  userEmail,
}: DeleteAccountDialogProps): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmText: "",
      password: "",
    },
  });

  const confirmText = watch("confirmText");
  const isConfirmValid = confirmText === CONFIRM_PHRASE;

  // Reset form and error when dialog closes
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        reset();
        setServerError(null);
      }
    },
    [reset]
  );

  const onSubmit = React.useCallback(
    async (data: DeleteAccountInput) => {
      setServerError(null);

      try {
        const res = await fetch("/api/auth/account", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: data.password }),
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setServerError(
            json.message ?? "Failed to delete account. Please try again."
          );
          return;
        }

        toast.success("Account deleted", {
          description: "Your account has been permanently deleted.",
        });

        setOpen(false);
        router.push("/login");
        router.refresh();
      } catch {
        setServerError("A network error occurred. Please try again.");
      }
    },
    [router]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          id="delete-account-btn"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete Account
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Warning icon */}
          <div
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
            aria-hidden="true"
          >
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          <DialogTitle className="text-center text-red-700 dark:text-red-400">
            Delete Account Permanently
          </DialogTitle>

          <DialogDescription className="text-center">
            This will permanently delete{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {userEmail}
            </span>{" "}
            and all associated data. This action{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">
              cannot be undone
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 pt-2"
          aria-label="Delete account confirmation form"
        >
          {/* Confirm phrase */}
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm-text">
              Type{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {CONFIRM_PHRASE}
              </code>{" "}
              to confirm
            </Label>
            <Input
              id="delete-confirm-text"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={CONFIRM_PHRASE}
              aria-invalid={!!errors.confirmText}
              aria-describedby={
                errors.confirmText ? "delete-confirm-text-error" : undefined
              }
              {...register("confirmText")}
            />
            {errors.confirmText && (
              <p
                id="delete-confirm-text-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.confirmText.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="delete-password">Confirm your password</Label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "delete-password-error" : undefined
              }
              {...register("password")}
            />
            {errors.password && (
              <p
                id="delete-password-error"
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <FormError message={serverError} />

          <DialogFooter className="gap-2 pt-2">
            {/* Cancel */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {/* Confirm delete */}
            <Button
              type="submit"
              id="delete-account-confirm-btn"
              variant="destructive"
              disabled={isSubmitting || !isConfirmValid}
              aria-busy={isSubmitting}
              aria-label="Permanently delete my account"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={14} label="Deleting account…" />
                  <span className="ml-2">Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="ml-2">Delete My Account</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { ZodIssue } from "zod";

export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


export class ValidationError extends APIError {
  public readonly errors: Record<string, string>;

  constructor(issues: ZodIssue[]) {
    super("Validation failed", 400, "VALIDATION_ERROR");
    this.errors = issues.reduce<Record<string, string>>((acc, issue) => {
      const field = issue.path.join(".") || "root";
      acc[field] = issue.message;
      return acc;
    }, {});
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}


export class AccountLockedError extends APIError {
  public readonly lockUntil: Date;

  constructor(lockUntil: Date) {
    const remaining = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
    super(
      `Account locked. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`,
      403,
      "ACCOUNT_LOCKED"
    );
    this.lockUntil = lockUntil;
  }
}


export class NotFoundError extends APIError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}


export class RateLimitError extends APIError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}


export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}


export class ConflictError extends APIError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

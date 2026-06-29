import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}


export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
}

/**
 * Creates a typed JSON success response.
 *
 * @param data - Response payload
 * @param message - Human-readable success message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with JSON body
 */
export function apiSuccess<T = unknown>(
  data: T,
  message = "Success",
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Creates a typed JSON error response.
 *
 * @param message - Human-readable error message
 * @param errors - Optional field-level Zod errors
 * @param code - Machine-readable error code
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with JSON body
 */
export function apiError(
  message: string,
  errors?: Record<string, string>,
  code?: string,
  status = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors }),
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Standardized HTTP utility functions for API responses
 * Provides consistent error format across all endpoints
 */

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}

export interface SuccessResponse<T> {
  data: T;
  timestamp: string;
}

// Error codes for common scenarios
export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  details?: unknown
): Response {
  const error: ErrorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };
  
  if (details !== undefined) {
    error.details = details;
  }
  
  // Log error for debugging
  console.error(`[API Error] ${code}: ${message}`, details || '');
  
  return Response.json(error, { status });
}

export function badRequest(message: string = "Bad request", details?: unknown) {
  return createErrorResponse(message, ErrorCode.BAD_REQUEST, 400, details);
}

export function unauthorized(message: string = "Unauthorized") {
  return createErrorResponse(message, ErrorCode.UNAUTHORIZED, 401);
}

export function forbidden(message: string = "Forbidden") {
  return createErrorResponse(message, ErrorCode.FORBIDDEN, 403);
}

export function notFound(message: string = "Resource not found") {
  return createErrorResponse(message, ErrorCode.NOT_FOUND, 404);
}

export function conflict(message: string = "Resource conflict") {
  return createErrorResponse(message, ErrorCode.CONFLICT, 409);
}

export function validationError(message: string = "Validation failed", details?: unknown) {
  return createErrorResponse(message, ErrorCode.VALIDATION_ERROR, 400, details);
}

export function rateLimitExceeded(message: string = "Rate limit exceeded") {
  return createErrorResponse(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429);
}

export function payloadTooLarge(message: string = "Request payload too large") {
  return createErrorResponse(message, ErrorCode.PAYLOAD_TOO_LARGE, 413);
}

export function serverError(error: unknown, details?: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const isDev = process.env.NODE_ENV === "development";
  
  // In development, include the full error details
  const errorDetails = isDev ? (error instanceof Error ? error.stack : error) : undefined;
  
  return createErrorResponse(
    message,
    ErrorCode.INTERNAL_ERROR,
    500,
    details || errorDetails
  );
}

export function serviceUnavailable(message: string = "Service temporarily unavailable") {
  return createErrorResponse(message, ErrorCode.SERVICE_UNAVAILABLE, 503);
}

export function success<T>(data: T, status: number = 200): Response {
  const response: SuccessResponse<T> = {
    data,
    timestamp: new Date().toISOString(),
  };
  return Response.json(response, { status });
}

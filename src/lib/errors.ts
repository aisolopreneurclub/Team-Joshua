import { NextResponse } from "next/server"

interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

const HTTP_STATUS_MAP: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
}

export function createApiError(
  code: string,
  message: string,
  details?: Record<string, string[]>
) {
  const status = HTTP_STATUS_MAP[code] ?? 500
  const body: ApiErrorBody = { error: { code, message, details } }
  return NextResponse.json(body, { status })
}

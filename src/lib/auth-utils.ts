import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createApiError } from "@/lib/errors"
import type { Role } from "@/domain/common/types"

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw createApiError("UNAUTHORIZED", "로그인이 필요합니다")
  }
  return session
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth()
  if (!roles.includes(session.user.role)) {
    throw createApiError("FORBIDDEN", "권한이 없습니다")
  }
  return session
}

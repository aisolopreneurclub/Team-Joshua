import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod/v4"
import { prisma } from "@/infrastructure/db/prisma"
import { createApiError } from "@/lib/errors"

const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return createApiError("VALIDATION_ERROR", "입력값이 올바르지 않습니다")
    }

    const { email, name, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return createApiError("CONFLICT", "이미 등록된 이메일입니다")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return createApiError("INTERNAL_ERROR", "회원가입 처리 중 오류가 발생했습니다")
  }
}

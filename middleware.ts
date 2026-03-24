// TODO: 인증 구현 후 NextAuth middleware 복원
import { NextResponse } from "next/server"

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

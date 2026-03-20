"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const { setUser } = useAuthStore()

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        role: session.user.role,
        avatar: null,
        employeeId: session.user.employeeId,
      })
    } else {
      setUser(null)
    }
  }, [session, setUser])

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn,
    signOut,
  }
}

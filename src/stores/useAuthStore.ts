"use client"

import { create } from "zustand"
import type { Role } from "@/domain/common/types"

interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  avatar: string | null
  employeeId: string | null
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

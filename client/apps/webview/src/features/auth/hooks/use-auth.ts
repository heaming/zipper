'use client'

import { create } from 'zustand'

interface AuthUser {
  id: number
  email: string
  nickname?: string
  buildingId?: number
}

interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

/**
 * 인증 상태 관리 (Zustand)
 */
export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))

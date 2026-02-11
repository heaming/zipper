/**
 * 인증 상태 관리 스토어
 * - 로그인/로그아웃
 * - 사용자 정보
 * - JWT 토큰 관리
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  nickname?: string
  phoneNumber?: string
  buildingId?: string
  buildingName?: string
  dong?: string
  ho?: string
  isBuildingVerified?: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (user: User, accessToken: string) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, accessToken) => {
        // localStorage에 토큰 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
        }
        
        set({
          user,
          accessToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        // localStorage에서 모든 인증 정보 제거
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('auth-storage') // Zustand persist storage 제거
        }
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

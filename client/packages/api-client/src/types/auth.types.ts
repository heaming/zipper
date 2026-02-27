/**
 * 인증/유저 도메인 타입
 */

export interface UserProfile {
  id: number
  email: string
  nickname?: string
  phoneNumber?: string
  buildingId?: number
  buildingName?: string
  dong?: string
  ho?: string
  isBuildingVerified?: boolean
  activityScore?: number
  level?: number
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  nickname?: string
  phoneNumber?: string
}

export interface LevelInfo {
  level: number
  icon: string
  name: string
  color: string
  activityScore: number
  progress: number
  remainingPoints: number
}

// 거주 인증 - GPS
export interface VerifyResidenceGpsRequest {
  buildingId: number
  latitude: number
  longitude: number
}

// 거주 인증 - 초대코드
export interface VerifyResidenceInviteCodeRequest {
  buildingId: number
  inviteCode: string
}

export interface VerifyResidenceResponse {
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  message?: string
}

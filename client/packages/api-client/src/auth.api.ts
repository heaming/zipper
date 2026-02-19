import type { ApiClient } from './client'

/**
 * Auth API
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    nickname?: string
    phoneNumber?: string
    buildingId?: number
    buildingName?: string
    dong?: string
    ho?: string
    isBuildingVerified?: boolean
    createdAt: string
    updatedAt: string
  }
}

export interface SignupRequest {
  email: string
  password: string
  phoneNumber?: string
}

export class AuthApi {
  constructor(private client: ApiClient) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.client.post('/api/auth/login', data)
  }

  async signup(data: SignupRequest): Promise<{ userId: number; message: string }> {
    return this.client.post('/api/auth/signup', data)
  }

  async logout(): Promise<void> {
    return this.client.post('/api/auth/logout')
  }

  async verifyResidence(data: {
    buildingId: number
    method: 'GPS' | 'INVITE_CODE' | 'PHOTO'
    latitude?: number
    longitude?: number
    inviteCode?: string
    image?: string
  }): Promise<{ verified: boolean }> {
    return this.client.post('/api/auth/verify-residence', data)
  }
}

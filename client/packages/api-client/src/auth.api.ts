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
    id: string
    email: string
    buildingId?: string
    nickname?: string
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

  async signup(data: SignupRequest): Promise<{ userId: string; message: string }> {
    return this.client.post('/api/auth/signup', data)
  }

  async logout(): Promise<void> {
    return this.client.post('/api/auth/logout')
  }

  async verifyResidence(data: {
    buildingId: string
    method: 'GPS' | 'INVITE_CODE' | 'PHOTO'
    latitude?: number
    longitude?: number
    inviteCode?: string
    image?: string
  }): Promise<{ verified: boolean }> {
    return this.client.post('/api/auth/verify-residence', data)
  }
}

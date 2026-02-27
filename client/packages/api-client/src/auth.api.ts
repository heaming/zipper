import type { ApiClient } from './client'
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UserProfile,
  LevelInfo,
  VerifyResidenceGpsRequest,
  VerifyResidenceInviteCodeRequest,
  VerifyResidenceResponse,
} from './types/auth.types'

export type { LoginRequest, LoginResponse, SignupRequest }

export class AuthApi {
  constructor(private client: ApiClient) {}

  // 이메일 중복 확인
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    return this.client.post('/api/auth/check-email', { email })
  }

  // 닉네임 중복 확인
  async checkNickname(nickname: string): Promise<{ exists: boolean }> {
    return this.client.post('/api/auth/check-nickname', { nickname })
  }

  // 전화번호 중복 확인
  async checkPhone(phoneNumber: string): Promise<{ exists: boolean }> {
    return this.client.post('/api/auth/check-phone', { phoneNumber })
  }

  // 이메일 인증 코드 발송
  async sendEmailVerification(email: string): Promise<{ message: string }> {
    return this.client.post('/api/auth/send-email-verification', { email })
  }

  // 이메일 인증 코드 확인
  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    return this.client.post('/api/auth/verify-email-code', { email, code })
  }

  // 회원가입
  async signup(data: SignupRequest): Promise<{ userId: number; message: string }> {
    return this.client.post('/api/auth/signup', data)
  }

  // 로그인
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.client.post('/api/auth/login', data)
  }

  // 로그아웃
  async logout(): Promise<void> {
    return this.client.post('/api/auth/logout')
  }

  // 거주 인증 — GPS
  async verifyResidenceByGps(data: VerifyResidenceGpsRequest): Promise<VerifyResidenceResponse> {
    return this.client.post('/api/auth/verify-residence/gps', data)
  }

  // 거주 인증 — 초대코드
  async verifyResidenceByInviteCode(data: VerifyResidenceInviteCodeRequest): Promise<VerifyResidenceResponse> {
    return this.client.post('/api/auth/verify-residence/invite-code', data)
  }

  // 거주 인증 — 우편물 사진 (FormData)
  async verifyResidenceByPostMail(buildingId: number, photoFile: File): Promise<VerifyResidenceResponse> {
    const formData = new FormData()
    formData.append('photo', photoFile)
    formData.append('buildingId', String(buildingId))
    return this.client.postFormData('/api/auth/verify-residence/post-mail', formData)
  }

  // 거주 인증 — 신분증 (FormData)
  async verifyResidenceByIdCard(buildingId: number, idCardFile: File): Promise<VerifyResidenceResponse> {
    const formData = new FormData()
    formData.append('idCard', idCardFile)
    formData.append('buildingId', String(buildingId))
    return this.client.postFormData('/api/auth/verify-residence/id-card', formData)
  }

  // 프로필 조회
  async getProfile(): Promise<UserProfile> {
    return this.client.get('/api/auth/profile')
  }

  // 닉네임 수정
  async updateNickname(buildingId: number, nickname: string): Promise<UserProfile> {
    return this.client.put('/api/auth/profile/nickname', { buildingId, nickname })
  }

  // 레벨 정보 조회
  async getLevel(): Promise<LevelInfo> {
    return this.client.get('/api/auth/level')
  }

  // 레벨 재계산 (활동 후 갱신)
  async recalculateLevel(): Promise<Pick<LevelInfo, 'level' | 'icon' | 'name' | 'color'>> {
    return this.client.post('/api/auth/level/recalculate')
  }
}

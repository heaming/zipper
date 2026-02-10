// Port 인터페이스 (Nest 의존성 ❌)
import { AuthUser } from '../models/auth-user';

export interface Authenticator {
  /**
   * 토큰을 검증하고 인증된 사용자 정보를 반환합니다
   */
  verify(token: string): Promise<AuthUser>;
  
  /**
   * 사용자 정보로 토큰을 생성합니다
   */
  generateToken(user: AuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

export const AUTHENTICATOR = Symbol('AUTHENTICATOR');

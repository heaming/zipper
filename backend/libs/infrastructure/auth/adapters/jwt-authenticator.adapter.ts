// Adapter 구현 (Nest 사용 가능 ✅)
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Authenticator } from '@domain/auth/ports/authenticator.port';
import { AuthUser } from '@domain/auth/models/auth-user';

@Injectable()
export class JwtAuthenticatorAdapter implements Authenticator {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token: string): Promise<AuthUser> {
    try {
      const payload = this.jwtService.verify(token);
      return new AuthUser(
        payload.sub,
        payload.email,
        payload.buildingId,
        payload.nickname,
      );
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }

  async generateToken(user: AuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      buildingId: user.buildingId,
      nickname: user.nickname,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}

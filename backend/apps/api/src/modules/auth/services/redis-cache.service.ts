import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // 캐시 매니저 직접 접근 (이메일 인증 코드 저장용)
  get cacheManagerInstance(): Cache {
    return this.cacheManager;
  }

  // 인증 요청 rate limit 체크
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const cacheKey = `rate_limit:${key}`;
    const count = await this.cacheManager.get<number>(cacheKey);

    if (count === undefined || count === null) {
      await this.cacheManager.set(cacheKey, 1, windowSeconds * 1000);
      return true;
    }

    if (count >= limit) {
      return false;
    }

    await this.cacheManager.set(cacheKey, count + 1, windowSeconds * 1000);
    return true;
  }

  // 인증 임시 상태 캐싱
  async setVerificationTempState(
    userId: number,
    verificationType: string,
    data: any,
    ttlSeconds: number = 300,
  ): Promise<void> {
    const key = `verification_temp:${userId}:${verificationType}`;
    await this.cacheManager.set(key, data, ttlSeconds * 1000);
  }

  async getVerificationTempState(userId: number, verificationType: string): Promise<any> {
    const key = `verification_temp:${userId}:${verificationType}`;
    return await this.cacheManager.get(key);
  }

  async deleteVerificationTempState(userId: number, verificationType: string): Promise<void> {
    const key = `verification_temp:${userId}:${verificationType}`;
    await this.cacheManager.del(key);
  }
}

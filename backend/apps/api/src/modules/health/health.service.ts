import { Injectable, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async check() {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
    };

    // 모든 서비스가 정상이면 status를 ok로, 하나라도 실패하면 unhealthy로 설정
    const allHealthy =
      status.database.status === 'ok' && status.cache.status === 'ok';

    return {
      ...status,
      status: allHealthy ? 'ok' : 'unhealthy',
    };
  }

  private async checkDatabase(): Promise<{
    status: string;
    message?: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkCache(): Promise<{
    status: string;
    message?: string;
  }> {
    try {
      // 간단한 캐시 테스트
      const testKey = 'health-check';
      const testValue = 'test';
      await this.cacheManager.set(testKey, testValue, 1);
      const retrieved = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);

      if (retrieved === testValue) {
        return { status: 'ok' };
      } else {
        return {
          status: 'error',
          message: 'Cache test failed: value mismatch',
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

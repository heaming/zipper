import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

// MVP에서는 Redis를 선택적으로 사용
// 필요시 cache-manager-redis-store 또는 cache-manager-redis-yet 사용
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Redis 사용 여부 확인
        const useRedis = configService.get('USE_REDIS') === 'true';
        
        if (useRedis) {
          // Redis 설정 (필요시 구현)
          return {
            ttl: 300, // 5 minutes default
          };
        }
        
        // 메모리 캐시 사용 (기본값)
        return {
          ttl: 300,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
})
export class RedisModule {}

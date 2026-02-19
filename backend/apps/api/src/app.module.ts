import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisModule } from '@infrastructure/cache/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuildingModule } from './modules/building/building.module';
import { CommunityModule } from './modules/community/community.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    AuthModule,
    BuildingModule,
    CommunityModule,
    ChatModule,
    NotificationModule,
    HealthModule,
  ],
})
export class AppModule {}

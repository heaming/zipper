import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './domain/entities/user.entity';
import { BuildingVerification } from './domain/entities/building-verification.entity';
import { Building } from '../building/domain/entities/building.entity';
import { BuildingMembership } from '../building/domain/entities/building-membership.entity';
import { JwtModule } from './infra/jwt/jwt.module';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { RedisCacheService } from './services/redis-cache.service';
import { EmailService } from './services/email.service';
import { IdCardProcessorService } from '@infrastructure/auth/services/id-card-processor.service';
import { BuildingModule } from '../building/building.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      BuildingVerification,
      Building,
      BuildingMembership,
    ]),
    PassportModule,
    JwtModule,
    BuildingModule, // BuildingService와 KakaoLocalService 사용을 위해 import
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RedisCacheService, EmailService, IdCardProcessorService],
  exports: [AuthService],
})
export class AuthModule {}

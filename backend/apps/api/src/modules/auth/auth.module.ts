import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './domain/entities/user.entity';
import { ResidenceVerification } from './domain/entities/residence-verification.entity';
import { Building } from '../building/domain/entities/building.entity';
import { BuildingMembership } from '../building/domain/entities/building-membership.entity';
import { JwtModule } from './infra/jwt/jwt.module';
import { JwtStrategy } from './infra/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ResidenceVerification,
      Building,
      BuildingMembership,
    ]),
    PassportModule,
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

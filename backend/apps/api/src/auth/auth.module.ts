// Module: DI 조립
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controller, Service
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// UseCases
import { LoginUseCase } from '@application/auth/usecases/login.usecase';
import { SignupUseCase } from '@application/auth/usecases/signup.usecase';
import { AuthorizeUserUseCase } from '@application/auth/usecases/authorize-user.usecase';

// Adapters
import { JwtAuthenticatorAdapter } from '@infrastructure/auth/adapters/jwt-authenticator.adapter';
import { BcryptPasswordHasherAdapter } from '@infrastructure/auth/adapters/bcrypt-password-hasher.adapter';
import { TypeOrmUserRepository } from '@infrastructure/auth/repositories/typeorm-user.repository';
import { JwtStrategy } from '@infrastructure/auth/strategies/jwt.strategy';

// Entities
import { UserEntity } from '@infrastructure/auth/persistence/user.entity';

// Ports
import { AUTHENTICATOR } from '@domain/auth/ports/authenticator.port';
import { PASSWORD_HASHER } from '@domain/auth/ports/password-hasher.port';
import { USER_REPOSITORY } from '@domain/auth/ports/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    
    // Port → Adapter 바인딩
    {
      provide: AUTHENTICATOR,
      useClass: JwtAuthenticatorAdapter,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    
    // UseCases
    {
      provide: LoginUseCase,
      useFactory: (userRepo, passwordHasher, authenticator) => {
        return new LoginUseCase(userRepo, passwordHasher, authenticator);
      },
      inject: [USER_REPOSITORY, PASSWORD_HASHER, AUTHENTICATOR],
    },
    {
      provide: SignupUseCase,
      useFactory: (userRepo, passwordHasher) => {
        return new SignupUseCase(userRepo, passwordHasher);
      },
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: AuthorizeUserUseCase,
      useFactory: (authenticator) => {
        return new AuthorizeUserUseCase(authenticator);
      },
      inject: [AUTHENTICATOR],
    },
  ],
  exports: [AuthService, AUTHENTICATOR, AuthorizeUserUseCase],
})
export class AuthModule {}

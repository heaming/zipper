// Service는 UseCase orchestration만 수행
import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '@application/auth/usecases/login.usecase';
import { LoginCommand } from '@application/auth/commands/login.command';
import { SignupUseCase, SignupCommand } from '@application/auth/usecases/signup.usecase';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
  ) {}

  async login(dto: LoginDto) {
    // DTO → Command 변환
    const command = new LoginCommand(dto.email, dto.password);
    
    // UseCase 실행
    return this.loginUseCase.execute(command);
  }

  async signup(dto: SignupDto) {
    // DTO → Command 변환
    // nickname을 phoneNumber로 임시 매핑 (나중에 User 모델 확장 가능)
    const command = new SignupCommand(
      dto.email,
      dto.password,
      dto.phoneNumber || dto.nickname
    );
    
    // UseCase 실행
    return this.signupUseCase.execute(command);
  }
}

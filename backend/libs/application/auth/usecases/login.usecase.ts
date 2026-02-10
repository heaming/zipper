// UseCase (Nest 의존성 ❌)
import { UserRepository } from '@domain/auth/ports/user.repository';
import { PasswordHasher } from '@domain/auth/ports/password-hasher.port';
import { Authenticator } from '@domain/auth/ports/authenticator.port';
import { AuthUser } from '@domain/auth/models/auth-user';
import { LoginCommand } from '../commands/login.command';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authenticator: Authenticator,
  ) {}

  async execute(command: LoginCommand) {
    // 1. 사용자 조회
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2. 비밀번호 검증
    const isValid = await this.passwordHasher.compare(command.password, user.password);
    if (!isValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 3. 토큰 생성
    const authUser = new AuthUser(user.id, user.email);
    const tokens = await this.authenticator.generateToken(authUser);

    return {
      ...tokens,
      user: authUser,
    };
  }
}

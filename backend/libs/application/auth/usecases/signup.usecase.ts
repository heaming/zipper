// UseCase (Nest 의존성 ❌)
import { UserRepository } from '@domain/auth/ports/user.repository';
import { PasswordHasher } from '@domain/auth/ports/password-hasher.port';
import { User } from '@domain/auth/models/user';

export class SignupCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly nickname: string,
    public readonly phoneNumber?: string,
  ) {}
}

export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: SignupCommand) {
    // 1. 이메일 중복 확인
    const existingEmail = await this.userRepository.findByEmail(command.email);
    if (existingEmail) {
      throw new Error('이미 가입된 이메일입니다.');
    }

    // 2. 닉네임 중복 확인
    const existingNickname = await this.userRepository.findByNickname(command.nickname);
    if (existingNickname) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await this.passwordHasher.hash(command.password);

    // 4. 사용자 생성
    const user = new User(
      0, // ID는 Repository에서 생성
      command.email,
      hashedPassword,
      command.nickname,
      command.phoneNumber,
    );

    // 5. 저장
    const savedUser = await this.userRepository.save(user);

    return {
      userId: savedUser.id,
      message: '회원가입이 완료되었습니다.',
    };
  }
}

// UseCase (Nest 의존성 ❌)
import { Authenticator } from '@domain/auth/ports/authenticator.port';
import { AuthUser } from '@domain/auth/models/auth-user';

export class AuthorizeUserUseCase {
  constructor(private readonly authenticator: Authenticator) {}

  async execute(token: string): Promise<AuthUser> {
    return this.authenticator.verify(token);
  }
}

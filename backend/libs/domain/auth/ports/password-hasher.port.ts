// Password Hasher Port (Nest 의존성 ❌)
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

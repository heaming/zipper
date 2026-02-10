// Repository Port 인터페이스 (Nest 의존성 ❌)
import { User } from '../models/user';

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Repository Adapter (Nest 사용 가능 ✅)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '@domain/auth/ports/user.repository';
import { User } from '@domain/auth/models/user';
import { UserEntity } from '../persistence/user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  // Entity <-> Domain 변환
  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.phoneNumber,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }

  private toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    if (domain.id) entity.id = domain.id;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.phoneNumber = domain.phoneNumber;
    return entity;
  }
}

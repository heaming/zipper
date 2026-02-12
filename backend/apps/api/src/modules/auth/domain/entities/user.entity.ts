import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BuildingVerification, BuildingVerificationStatus } from './building-verification.entity';
import { BuildingMembership } from '../../../building/domain/entities/building-membership.entity';
import { Building } from '../../../building/domain/entities/building.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed

  @Column({ unique: true })
  nickname: string; // 닉네임은 중복 불가, 변경 불가

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({ nullable: true })
  dong: string; // 동 정보 (예: '101동', 'A동')

  @Column({ nullable: true })
  ho: string; // 호수 정보 (예: '1201호', '701호')

  @Column({
    type: 'enum',
    enum: BuildingVerificationStatus,
    default: BuildingVerificationStatus.PENDING,
  })
  buildingVerificationStatus: BuildingVerificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => BuildingVerification, (verification) => verification.user)
  buildingVerifications: BuildingVerification[];

  @OneToMany(() => BuildingMembership, (membership: BuildingMembership) => membership.user)
  memberships: BuildingMembership[];
}

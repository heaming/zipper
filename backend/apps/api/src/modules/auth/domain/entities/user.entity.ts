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

  // 레벨 시스템 관련 필드
  @Column({ default: 0 })
  activityScore: number; // 활동 점수

  @Column({ default: 1 })
  level: number; // 레벨 (1~6, 6은 ZIPPER 지기로 관리자가 직접 부여)

  @Column({ nullable: true })
  levelUpdatedAt: Date; // 레벨 업데이트 시간

  @Column({ nullable: true })
  lastActivityDate: Date; // 마지막 활동 날짜 (30일 이상 활동 유지 확인용)

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

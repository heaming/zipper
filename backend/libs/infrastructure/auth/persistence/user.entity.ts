// TypeORM 엔티티 (Infrastructure에 위치)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  buildingId: number; // 사용자가 속한 건물 ID

  @Column({ nullable: true })
  dong: string; // 사용자가 속한 동 (예: "101동", "A동")

  @Column({ nullable: true })
  ho: string; // 사용자가 속한 호수 (예: "1201호")

  @Column({ default: false })
  isBuildingVerified: boolean; // 건물 인증 완료 여부

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

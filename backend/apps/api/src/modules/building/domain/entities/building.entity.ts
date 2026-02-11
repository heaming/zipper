import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BuildingMembership } from './building-membership.entity';
import { Post } from '../../../community/domain/entities/post.entity';
import { ChatRoom } from '../../../chat/domain/entities/chat-room.entity';

export enum BuildingType {
  APARTMENT = 'APARTMENT',
  OFFICETEL = 'OFFICETEL',
  VILLA = 'VILLA',
}

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  neighborhood: string;

  @Column({ nullable: true })
  village: string;

  // 도로명 주소
  @Column({ nullable: true })
  roadName: string;

  @Column({ nullable: true })
  roadNumber: string;

  @Column({ nullable: true })
  roadAddress: string;

  // 지번 주소
  @Column({ nullable: true })
  lotNumber: string;

  @Column({ nullable: true })
  lotAddress: string;

  // 건물 상세
  @Column({ nullable: true })
  buildingCode: string;

  @Column({ nullable: true })
  totalHouseholds: number;

  @Column({ nullable: true })
  isVerified: boolean;

  // 위치
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    type: 'enum',
    enum: BuildingType,
    nullable: true,
  })
  buildingType: BuildingType;

  // 통계
  @Column({ nullable: true })
  userCount: number;

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @Column({ unique: true, nullable: true })
  inviteCode: string; // 자동 생성

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BuildingMembership, (membership) => membership.building)
  memberships: BuildingMembership[];

  @OneToMany(() => Post, (post: any) => post.building)
  posts: any[];

  @OneToMany(() => ChatRoom, (room: any) => room.building)
  chatRooms: any[];
}

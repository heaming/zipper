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

  // 건물명 (필수)
  @Column()
  name: string;

  // 도로명 주소 전체 (카카오 우편번호 서비스 roadAddress)
  @Column({ nullable: true })
  roadAddress: string;

  // 지번 주소 전체 (카카오 우편번호 서비스 jibunAddress)
  @Column({ nullable: true })
  jibunAddress: string;

  // 법정동명 (카카오 우편번호 서비스 bname)
  @Column({ nullable: true })
  bname: string;

  // 시/도 (카카오 우편번호 서비스 sido)
  @Column({ nullable: true })
  sido: string;

  // 시/군/구 (카카오 우편번호 서비스 sigungu)
  @Column({ nullable: true })
  sigungu: string;

  // 위치 좌표 (카카오 로컬 API로 가져옴)
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  // 건물 유형
  @Column({
    type: 'enum',
    enum: BuildingType,
    nullable: true,
  })
  buildingType: BuildingType;

  // 통계
  @Column({ nullable: true })
  totalHouseholds: number;

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

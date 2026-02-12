import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Building } from '../../../building/domain/entities/building.entity';

export enum BuildingVerificationType {
  POST_MAIL = 'POST_MAIL',
  ID_CARD = 'ID_CARD',
  GPS = 'GPS',
}

export enum BuildingVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('building_verifications')
export class BuildingVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.buildingVerifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({
    type: 'enum',
    enum: BuildingVerificationType,
  })
  verificationType: BuildingVerificationType;

  @Column({
    type: 'enum',
    enum: BuildingVerificationStatus,
    default: BuildingVerificationStatus.PENDING,
  })
  status: BuildingVerificationStatus;

  // GPS 인증용
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  gpsLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  gpsLongitude: number;

  // 우편물 인증용 (사진 URL)
  @Column({ nullable: true })
  postMailPhotoUrl: string;

  // 주민등록증 인증용 (OCR 결과, 마스킹된 이미지는 저장하지 않음)
  @Column({ type: 'json', nullable: true })
  idCardOcrResult: {
    name?: string;
    address?: string;
    registrationNumber?: string; // 마스킹된 주민등록번호
  };

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

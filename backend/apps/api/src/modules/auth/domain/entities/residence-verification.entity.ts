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

export enum VerificationType {
  GPS = 'GPS',
  INVITE_CODE = 'INVITE_CODE',
  PHOTO = 'PHOTO',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('residence_verifications')
export class ResidenceVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.verifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({
    type: 'enum',
    enum: VerificationType,
  })
  verificationType: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  gpsLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  gpsLongitude: number;

  @Column({ nullable: true })
  inviteCode: string;

  @Column({ nullable: true })
  verificationPhotoUrl: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

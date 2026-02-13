import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../auth/domain/entities/user.entity';

export enum ReportType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

export enum ReportReason {
  SPAM = 'spam',
  ABUSE = 'abuse',
  INAPPROPRIATE = 'inappropriate',
  FAKE = 'fake',
  OTHER = 'other',
}

@Entity('reports')
@Index(['reportedUserId', 'createdAt'])
@Index(['targetType', 'targetId'])
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number; // 신고한 사용자 ID

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  reportedUserId: number; // 신고당한 사용자 ID

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: User;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  targetType: ReportType; // 'post' | 'comment' | 'user'

  @Column({ nullable: true })
  targetId: number; // postId 또는 commentId (user 신고의 경우 null)

  // 외래 키 관계는 제거 (targetType에 따라 다른 테이블 참조하므로)
  // 필요시 조회 시에만 관계를 사용

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  @Column({ nullable: true })
  description: string; // 신고 사유 상세 설명

  @Column({ default: false })
  isProcessed: boolean; // 관리자 처리 여부

  @CreateDateColumn()
  createdAt: Date;
}

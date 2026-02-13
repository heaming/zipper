import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_activities')
@Unique(['userId', 'activityDate'])
@Index(['userId', 'activityDate'])
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  activityDate: Date; // 활동 날짜 (YYYY-MM-DD)

  @Column({ default: 0 })
  dailyScore: number; // 해당 날짜에 획득한 점수 (최대 100)

  @CreateDateColumn()
  createdAt: Date;
}

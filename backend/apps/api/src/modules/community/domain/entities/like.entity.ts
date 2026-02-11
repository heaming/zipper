import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../auth/domain/entities/user.entity';

@Entity('likes')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  targetType: string; // 'post' or 'comment'

  @Column()
  targetId: number; // postId or commentId

  @CreateDateColumn()
  createdAt: Date;
}

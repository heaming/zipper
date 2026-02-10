// TypeORM 엔티티 (Infrastructure에 위치)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('likes')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  targetType: string; // 'post' or 'comment'

  @Column()
  targetId: number; // postId or commentId

  @CreateDateColumn()
  createdAt: Date;
}

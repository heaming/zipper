// TypeORM 엔티티 (Infrastructure에 위치)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('comments')
@Index(['postId', 'createdAt'])
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  authorId: number;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  parentCommentId: number; // 대댓글용

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

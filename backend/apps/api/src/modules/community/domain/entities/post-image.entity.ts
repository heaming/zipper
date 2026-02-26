import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_images')
@Index(['postId', 'orderIndex'])
export class PostImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  postId: number;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  imageUrl: string;

  @Column({ default: 0 })
  orderIndex: number; // 이미지 순서

  @CreateDateColumn()
  createdAt: Date;
}

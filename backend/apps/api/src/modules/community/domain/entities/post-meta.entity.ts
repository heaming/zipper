import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_meta')
@Index(['postId'])
export class PostMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.meta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // 가격 (공동구매, 마켓용)

  @Column({ nullable: true })
  quantity: number; // 수량 (공동구매용)

  @Column({ nullable: true })
  deadline: Date; // 마감일 (공동구매용)

  @Column({ nullable: true })
  locationDetail: string; // 상세 위치 정보

  @Column('json', { nullable: true })
  extraData: Record<string, any>; // 확장 가능한 추가 데이터 (JSON)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

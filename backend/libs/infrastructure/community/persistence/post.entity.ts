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

@Entity('posts')
@Index(['buildingId', 'boardType', 'createdAt'])
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  @Column()
  buildingId: number;

  @Column()
  boardType: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hotScore: number;

  @Column({ default: false })
  isHot: boolean;

  @Column({ nullable: true })
  hotCalculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

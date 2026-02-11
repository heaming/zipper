import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../../auth/domain/entities/user.entity';
import { Building } from '../../../building/domain/entities/building.entity';
import { Comment } from './comment.entity';
import { ChatRoom } from '../../../chat/domain/entities/chat-room.entity';

// BoardType을 문자열로 사용 (시드 데이터와 호환)
export type BoardType = 'togather' | 'share' | 'lifestyle' | 'chat' | 'market';

@Entity('posts')
@Index(['buildingId', 'boardType', 'createdAt'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  buildingId: number;

  @ManyToOne(() => Building, (building) => building.posts)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column()
  boardType: string; // 'togather' | 'share' | 'lifestyle' | 'chat' | 'market'

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

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => ChatRoom, (room: any) => room.post)
  chatRooms: any[];
}

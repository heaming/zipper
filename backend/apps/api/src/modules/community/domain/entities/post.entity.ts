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
import { PostImage } from './post-image.entity';
import { PostMeta } from './post-meta.entity';

// BoardType enum - 향후 확장 가능하도록 enum으로 정의
export enum BoardType {
  TOGATHER = 'togather',
  SHARE = 'share',
  LIFESTYLE = 'lifestyle',
  CHAT = 'chat',
  MARKET = 'market',
}

// Post Status enum
export enum PostStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DELETED = 'deleted',
}

@Entity('posts')
@Index(['buildingId', 'boardType', 'createdAt'])
@Index(['buildingId', 'status', 'createdAt'])
@Index(['buildingId', 'deletedAt'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  @Index()
  buildingId: number;

  @ManyToOne(() => Building, (building) => building.posts)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({
    type: 'enum',
    enum: BoardType,
  })
  @Index()
  boardType: BoardType;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.ACTIVE,
  })
  status: PostStatus;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: false })
  isCommercial: boolean; // MARKET 태그 또는 상업적 게시글 여부

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

  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images: PostImage[];

  @OneToMany(() => PostMeta, (meta) => meta.post, { cascade: true })
  meta: PostMeta;
}

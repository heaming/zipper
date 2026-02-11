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
import { Post } from '../../../community/domain/entities/post.entity';
import { Comment } from '../../../community/domain/entities/comment.entity';
import { ChatRoom } from '../../../chat/domain/entities/chat-room.entity';

export enum NotificationType {
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  MENTION = 'MENTION',
  HOT_POST = 'HOT_POST',
  CHAT_MENTION = 'CHAT_MENTION',
}

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  relatedPostId: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'relatedPostId' })
  relatedPost: Post;

  @Column({ nullable: true })
  relatedCommentId: number;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'relatedCommentId' })
  relatedComment: Comment;

  @Column({ nullable: true })
  relatedChatRoomId: number;

  @ManyToOne(() => ChatRoom)
  @JoinColumn({ name: 'relatedChatRoomId' })
  relatedChatRoom: ChatRoom;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../../auth/domain/entities/user.entity';

@Entity('chat_room_members')
@Unique(['roomId', 'userId'])
export class ChatRoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomId: number;

  @ManyToOne(() => ChatRoom, (room) => room.members)
  @JoinColumn({ name: 'roomId' })
  room: ChatRoom;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  joinedAt: Date;

  @Column({ nullable: true })
  lastReadAt: Date; // MVP에서는 미사용

  @CreateDateColumn()
  createdAt: Date;
}

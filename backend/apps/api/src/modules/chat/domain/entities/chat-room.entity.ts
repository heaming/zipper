import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Building } from '../../../building/domain/entities/building.entity';
import { User } from '../../../auth/domain/entities/user.entity';
import { Post } from '../../../community/domain/entities/post.entity';
import { ChatMessage } from './chat-message.entity';
import { ChatRoomMember } from './chat-room-member.entity';

export enum RoomType {
  BUILDING = 'BUILDING',
  TOPIC = 'TOPIC',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  buildingId: number;

  @ManyToOne(() => Building, (building) => building.chatRooms)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  roomType: RoomType;

  @Column({ nullable: true })
  topicName: string;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => Post, (post) => post.chatRooms)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  @OneToMany(() => ChatRoomMember, (member) => member.room)
  members: ChatRoomMember[];
}

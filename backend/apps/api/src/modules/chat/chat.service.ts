import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom, RoomType } from './domain/entities/chat-room.entity';
import { ChatMessage, MessageType } from './domain/entities/chat-message.entity';
import { ChatRoomMember } from './domain/entities/chat-room-member.entity';
import { BuildingMembership, MembershipStatus } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatRoomMember)
    private chatRoomMemberRepository: Repository<ChatRoomMember>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getRooms(buildingId: number, userId: number) {
    await this.verifyMembership(userId, buildingId);

    const rooms = await this.chatRoomRepository.find({
      where: { buildingId },
      order: { updatedAt: 'DESC' },
      relations: ['building'],
    });

    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await this.chatMessageRepository.findOne({
          where: { roomId: room.id },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        let senderNickname = '익명';
        if (lastMessage) {
          const sender = await this.userRepository.findOne({
            where: { id: lastMessage.senderId },
          });
          senderNickname = sender?.nickname || '익명';
        }

        return {
          id: room.id,
          roomType: room.roomType,
          topicName: room.topicName,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderNickname,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount: 0, // MVP에서는 0
          createdAt: room.createdAt,
        };
      }),
    );

    return { rooms: roomsWithLastMessage };
  }

  async getOrCreateBuildingRoom(buildingId: number, userId: number) {
    await this.verifyMembership(userId, buildingId);

    let room = await this.chatRoomRepository.findOne({
      where: {
        buildingId,
        roomType: RoomType.BUILDING,
      },
    });

    if (!room) {
      room = this.chatRoomRepository.create({
        buildingId,
        roomType: RoomType.BUILDING,
        createdBy: userId,
      });
      room = await this.chatRoomRepository.save(room);
    }

    // 멤버 추가
    await this.joinRoom(room.id, userId);

    return room;
  }

  async createRoom(userId: number, dto: CreateChatRoomDto) {
    await this.verifyMembership(userId, dto.buildingId);

    const room = this.chatRoomRepository.create({
      buildingId: dto.buildingId,
      roomType: dto.roomType,
      topicName: dto.topicName,
      postId: dto.postId,
      createdBy: userId,
    });

    const savedRoom = await this.chatRoomRepository.save(room);

    // 생성자 자동 입장
    await this.joinRoom(savedRoom.id, userId);

    return savedRoom;
  }

  async joinRoom(roomId: number, userId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userId, room.buildingId);

    const existingMember = await this.chatRoomMemberRepository.findOne({
      where: { roomId, userId },
    });

    if (existingMember) {
      return existingMember;
    }

    const member = this.chatRoomMemberRepository.create({
      roomId,
      userId,
      joinedAt: new Date(),
    });

    return await this.chatRoomMemberRepository.save(member);
  }

  async getMessages(
    roomId: number,
    userId: number,
    before?: Date,
    limit: number = 50,
  ) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userId, room.buildingId);

    const queryBuilder = this.chatMessageRepository
      .createQueryBuilder('message')
      .where('message.roomId = :roomId', { roomId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit)
      .leftJoinAndSelect('message.sender', 'sender');

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before });
    }

    const messages = await queryBuilder.getMany();

    // 역순으로 정렬 (오래된 것부터)
    messages.reverse();

    const messagesWithNicknames = await Promise.all(
      messages.map(async (message) => {
        const sender = await this.userRepository.findOne({
          where: { id: message.senderId },
        });

        return {
          id: message.id,
          content: message.content,
          senderNickname: sender?.nickname || '익명',
          messageType: message.messageType,
          imageUrl: message.imageUrl,
          createdAt: message.createdAt,
        };
      }),
    );

    const hasMore = messages.length === limit;

    return {
      messages: messagesWithNicknames,
      hasMore,
    };
  }

  async sendMessage(
    roomId: number,
    userId: number,
    dto: SendMessageDto,
  ): Promise<ChatMessage> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userId, room.buildingId);

    const message = this.chatMessageRepository.create({
      roomId,
      senderId: userId,
      content: dto.content,
      messageType: dto.messageType || MessageType.TEXT,
      imageUrl: dto.imageUrl,
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    // 채팅방 업데이트 시간 갱신
    room.updatedAt = new Date();
    await this.chatRoomRepository.save(room);

    return savedMessage;
  }

  private async verifyMembership(userId: number, buildingId: number) {
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        buildingId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('해당 건물의 멤버가 아닙니다.');
    }
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/domain/entities/user.entity';
import { ChatRoom } from './domain/entities/chat-room.entity';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // WebView 환경에서는 적절히 설정
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, number>(); // socketId -> userId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, user.id);
      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('error', { message: '인증이 필요합니다.' });
        return;
      }

      await this.chatService.joinRoom(parseInt(data.roomId), userId);
      client.join(data.roomId);

      const room = await this.chatRoomRepository.findOne({
        where: { id: parseInt(data.roomId) },
      });

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      // 같은 방의 다른 사용자들에게 알림
      client.to(data.roomId).emit('user-joined', {
        roomId: data.roomId,
        userId,
        nickname: user?.nickname || '익명',
        joinedAt: new Date(),
      });

      client.emit('join-room', {
        success: true,
        roomId: data.roomId,
      });
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return;
      }

      client.leave(data.roomId);

      const room = await this.chatRoomRepository.findOne({
        where: { id: parseInt(data.roomId) },
      });

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      // 같은 방의 다른 사용자들에게 알림
      client.to(data.roomId).emit('user-left', {
        roomId: data.roomId,
        userId,
        nickname: user?.nickname || '익명',
        leftAt: new Date(),
      });

      client.emit('leave-room', {
        success: true,
        roomId: data.roomId,
      });
    } catch (error) {
      this.logger.error(`Leave room error: ${error.message}`);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto & { roomId: string },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('message-error', { error: '인증이 필요합니다.' });
        return;
      }

      const message = await this.chatService.sendMessage(
        parseInt(data.roomId),
        userId,
        {
          content: data.content,
          messageType: data.messageType,
          imageUrl: data.imageUrl,
        },
      );

      const room = await this.chatRoomRepository.findOne({
        where: { id: parseInt(data.roomId) },
      });

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      const messageData = {
        id: message.id,
        roomId: message.roomId,
        content: message.content,
        senderId: message.senderId,
        senderNickname: user?.nickname || '익명',
        messageType: message.messageType,
        imageUrl: message.imageUrl,
        createdAt: message.createdAt,
      };

      // 같은 방의 모든 사용자에게 메시지 브로드캐스트
      this.server.to(data.roomId).emit('new-message', messageData);

      // 전송자에게 확인
      client.emit('message-sent', {
        messageId: message.id,
        roomId: message.roomId,
        createdAt: message.createdAt,
      });
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      client.emit('message-error', { error: error.message });
    }
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    const room = await this.chatRoomRepository.findOne({
      where: { id: parseInt(data.roomId) },
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    client.to(data.roomId).emit('user-typing', {
      roomId: data.roomId,
      userId,
      nickname: user?.nickname || '익명',
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(data.roomId).emit('user-stopped-typing', {
      roomId: data.roomId,
      userId,
    });
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = client.handshake.auth?.token;
    if (token) {
      return token;
    }

    return null;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRoom } from './domain/entities/chat-room.entity';
import { ChatMessage } from './domain/entities/chat-message.entity';
import { ChatRoomMember } from './domain/entities/chat-room-member.entity';
import { BuildingMembership } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { JwtModule } from '../auth/infra/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatMessage,
      ChatRoomMember,
      BuildingMembership,
      User,
    ]),
    JwtModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}

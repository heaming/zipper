import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async getRooms(
    @CurrentUser() user: any,
    @Query('buildingId') buildingId: string,
  ) {
    return this.chatService.getRooms(parseInt(buildingId), user.id);
  }

  @Post('rooms')
  async createRoom(
    @CurrentUser() user: any,
    @Body() dto: CreateChatRoomDto,
  ) {
    return this.chatService.createRoom(user.id, dto);
  }

  @Post('rooms/:roomId/join')
  async joinRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.joinRoom(parseInt(roomId), user.id);
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @CurrentUser() user: any,
    @Param('roomId') roomId: string,
    @Query('before') before?: string,
    @Query('limit') limit: string = '50',
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.chatService.getMessages(
      parseInt(roomId),
      user.id,
      beforeDate,
      parseInt(limit),
    );
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    const message = await this.chatService.sendMessage(parseInt(roomId), user.id, dto);
    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}

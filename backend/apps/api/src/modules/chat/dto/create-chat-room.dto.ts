import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { RoomType } from '../domain/entities/chat-room.entity';

export class CreateChatRoomDto {
  @IsNumber()
  buildingId: number;

  @IsEnum(RoomType)
  roomType: RoomType;

  @IsOptional()
  @IsString()
  topicName?: string;

  @IsOptional()
  @IsNumber()
  postId?: number;
}

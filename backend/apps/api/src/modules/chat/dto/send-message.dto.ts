import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../domain/entities/chat-message.entity';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

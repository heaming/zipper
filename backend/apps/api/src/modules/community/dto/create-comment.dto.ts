import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}

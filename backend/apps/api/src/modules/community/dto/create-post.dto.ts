import { IsString, IsIn, IsOptional, IsArray, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PostMetaDto {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  deadline?: string; // ISO date string

  @IsOptional()
  @IsString()
  locationDetail?: string;

  @IsOptional()
  @IsObject()
  extraData?: Record<string, any>;
}

export class CreatePostDto {
  // buildingId는 클라이언트에서 받지 않음 - 사용자 멤버십에서 추출

  @IsIn(['togather', 'share', 'lifestyle', 'chat', 'market'])
  boardType: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PostMetaDto)
  meta?: PostMetaDto;
}

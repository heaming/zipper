import { IsString, IsIn, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsNumber()
  buildingId: number;

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
}

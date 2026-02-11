import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  name: string; // 건물명

  @IsString()
  type: string; // 건물 타입

  // 행정구역
  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsString()
  village?: string;

  // 도로명 주소
  @IsOptional()
  @IsString()
  roadName?: string;

  @IsOptional()
  @IsString()
  roadNumber?: string;

  @IsOptional()
  @IsString()
  roadAddress?: string;

  // 지번 주소
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  lotAddress?: string;

  // 건물 상세
  @IsOptional()
  @IsString()
  dong?: string;

  @IsOptional()
  @IsString()
  buildingCode?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  // 위치
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // 통계
  @IsOptional()
  @IsNumber()
  totalHouseholds?: number;
}

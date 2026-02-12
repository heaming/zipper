import { IsString, IsOptional, IsNumber } from 'class-validator';

/**
 * 카카오 우편번호 서비스 응답 기준 DTO
 * https://postcode.map.daum.net/guide 참고
 */
export class CreateBuildingDto {
  @IsString()
  name: string; // 건물명

  // 카카오 우편번호 서비스 기본 필드 (실제 사용되는 필드만)
  @IsOptional()
  @IsString()
  roadAddress?: string; // 도로명 주소

  @IsOptional()
  @IsString()
  jibunAddress?: string; // 지번 주소

  @IsOptional()
  @IsString()
  bname?: string; // 법정동명

  @IsOptional()
  @IsString()
  sido?: string; // 시/도

  @IsOptional()
  @IsString()
  sigungu?: string; // 시/군/구

  // 위치 좌표 (카카오 로컬 API로 가져옴)
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // 건물 타입
  @IsOptional()
  @IsString()
  buildingType?: string;

  // 통계
  @IsOptional()
  @IsNumber()
  totalHouseholds?: number;
}

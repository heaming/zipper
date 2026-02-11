import { IsString, IsNumber, IsOptional } from 'class-validator';

export class VerifyResidenceGpsDto {
  @IsNumber()
  buildingId: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class VerifyResidenceInviteCodeDto {
  @IsNumber()
  buildingId: number;

  @IsString()
  inviteCode: string;
}

export class VerifyResidencePhotoDto {
  @IsNumber()
  buildingId: number;
}

export class UpdateNicknameDto {
  @IsNumber()
  buildingId: number;

  @IsString()
  @IsOptional()
  nickname: string;
}

import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nickname: string; // 닉네임은 필수, 중복 불가, 변경 불가

  // 휴대폰 번호는 필수
  @IsString()
  phoneNumber: string;

  // 주소 정보 (회원가입 시 입력)
  @IsNumber()
  buildingId: number;

  @IsOptional()
  @IsString()
  dong?: string; // 동 정보 (예: '101동', 'A동')

  @IsOptional()
  @IsString()
  ho?: string; // 호수 정보 (예: '1201호', '701호')
}

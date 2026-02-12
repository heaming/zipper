import { IsEmail, IsString, Length } from 'class-validator';

export class SendEmailVerificationDto {
  @IsEmail()
  email: string;
}

export class VerifyEmailCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

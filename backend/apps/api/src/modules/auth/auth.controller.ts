import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../common/config/multer.config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  VerifyResidenceGpsDto,
  VerifyResidenceInviteCodeDto,
  UpdateNicknameDto,
} from './dto/verify-residence.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: { email: string }) {
    const exists = await this.authService.checkEmailExists(dto.email);
    return { exists };
  }

  @Public()
  @Post('check-nickname')
  async checkNickname(@Body() dto: { nickname: string }) {
    const exists = await this.authService.checkNicknameExists(dto.nickname);
    return { exists };
  }

  @Public()
  @Post('check-phone')
  async checkPhone(@Body() dto: { phoneNumber: string }) {
    const exists = await this.authService.checkPhoneNumberExists(dto.phoneNumber);
    return { exists };
  }

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('send-email-verification')
  async sendEmailVerification(@Body() dto: { email: string }) {
    return this.authService.sendEmailVerificationCode(dto.email);
  }

  @Public()
  @Post('verify-email-code')
  async verifyEmailCode(@Body() dto: { email: string; code: string }) {
    return this.authService.verifyEmailCode(dto.email, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-residence/gps')
  async verifyResidenceByGps(
    @CurrentUser() user: any,
    @Body() dto: VerifyResidenceGpsDto,
  ) {
    return this.authService.verifyResidenceByGps(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-residence/invite-code')
  async verifyResidenceByInviteCode(
    @CurrentUser() user: any,
    @Body() dto: VerifyResidenceInviteCodeDto,
  ) {
    return this.authService.verifyResidenceByInviteCode(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-residence/post-mail')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async verifyResidenceByPostMail(
    @CurrentUser() user: any,
    @Body() body: { buildingId: string },
    @UploadedFile() file: any,
  ) {
    // 파일 업로드 로직은 별도 구현 필요 (S3 등)
    const photoUrl = file ? `/uploads/${file.filename}` : null;
    return this.authService.verifyResidenceByPostMail(
      user.id,
      parseInt(body.buildingId),
      photoUrl,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-residence/id-card')
  @UseInterceptors(FileInterceptor('idCard', multerConfig))
  async verifyResidenceByIdCard(
    @CurrentUser() user: any,
    @Body() body: { buildingId: string },
    @UploadedFile() file: any,
  ) {
    // 주민등록증 이미지 처리 (OCR, 마스킹)는 infrastructure 레이어에서 처리
    const idCardImage = file ? file.buffer : null;
    return this.authService.verifyResidenceByIdCard(
      user.id,
      parseInt(body.buildingId),
      idCardImage,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/nickname')
  async updateNickname(
    @CurrentUser() user: any,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.authService.updateNickname(
      user.id,
      dto.buildingId,
      dto.nickname,
    );
  }
}

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
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
  @Post('verify-residence/photo')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async verifyResidenceByPhoto(
    @CurrentUser() user: any,
    @Body() body: { buildingId: string },
    @UploadedFile() file: any,
  ) {
    // 파일 업로드 로직은 별도 구현 필요 (S3 등)
    const photoUrl = file ? `/uploads/${file.filename}` : null;
    return this.authService.verifyResidenceByPhoto(
      user.id,
      parseInt(body.buildingId),
      photoUrl,
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

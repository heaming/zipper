import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';
import {
  BuildingVerification,
  BuildingVerificationType,
  BuildingVerificationStatus,
} from './domain/entities/building-verification.entity';
import { Building } from '../building/domain/entities/building.entity';
import { BuildingMembership, MembershipStatus } from '../building/domain/entities/building-membership.entity';
import { PasswordUtil } from '../../common/utils/password.util';
import { RedisCacheService } from './services/redis-cache.service';
import { EmailService } from './services/email.service';
import { IdCardProcessorService } from '@infrastructure/auth/services/id-card-processor.service';
import { KakaoLocalService } from '../building/services/kakao-local.service';
import { LevelService } from './services/level.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  VerifyResidenceGpsDto,
  VerifyResidenceInviteCodeDto,
} from './dto/verify-residence.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BuildingVerification)
    private verificationRepository: Repository<BuildingVerification>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    private jwtService: JwtService,
    private redisCacheService: RedisCacheService,
    private emailService: EmailService,
    private idCardProcessorService: IdCardProcessorService,
    private kakaoLocalService: KakaoLocalService,
    private levelService: LevelService,
  ) {}

  async checkEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    return !!existingUser;
  }

  async checkNicknameExists(nickname: string): Promise<boolean> {
    const existingNickname = await this.userRepository.findOne({
      where: { nickname },
    });
    return !!existingNickname;
  }

  async checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
    const existingPhone = await this.userRepository.findOne({
      where: { phoneNumber },
    });
    return !!existingPhone;
  }

  async signup(signupDto: SignupDto) {
    // 1. 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 2. 닉네임 중복 확인
    const existingNickname = await this.userRepository.findOne({
      where: { nickname: signupDto.nickname },
    });

    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 3. 휴대폰 번호 중복 확인
    if (signupDto.phoneNumber) {
      const existingPhone = await this.userRepository.findOne({
        where: { phoneNumber: signupDto.phoneNumber },
      });

      if (existingPhone) {
        throw new ConflictException('이미 사용 중인 휴대폰 번호입니다.');
      }
    }

    // 3. 휴대폰 번호는 필수
    if (!signupDto.phoneNumber) {
      throw new ConflictException('휴대폰 번호는 필수입니다.');
    }
    
    // TODO: 휴대폰 번호 또는 이메일 인증 로직 구현 (SMS/Email 인증 코드 발송)

    // 4. 비밀번호 해싱
    const hashedPassword = await PasswordUtil.hash(signupDto.password);

    // 4. 건물 존재 확인
    // (프론트엔드에서 이미 building 검색/생성을 완료했으므로 buildingId만 확인)
    const building = await this.buildingRepository.findOne({
      where: { id: signupDto.buildingId },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // 5. 사용자 생성 (인증 상태는 PENDING으로 시작, buildingId와 매핑)
    const user = this.userRepository.create({
      email: signupDto.email,
      password: hashedPassword,
      nickname: signupDto.nickname,
      phoneNumber: signupDto.phoneNumber,
      buildingId: signupDto.buildingId,
      dong: signupDto.dong,
      ho: signupDto.ho,
      buildingVerificationStatus: BuildingVerificationStatus.PENDING,
    });

    const savedUser = await this.userRepository.save(user);

    // TODO: 휴대폰 번호 또는 이메일 인증 로직 (SMS/Email 인증 코드 발송)
    // 현재는 틀만 구성

    return {
      userId: savedUser.id,
      buildingId: savedUser.buildingId,
      message: '회원가입이 완료되었습니다. 인증을 완료해주세요.',
    };
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ['building'],
      });

      if (!user) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      const isPasswordValid = await PasswordUtil.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      // building 정보 로드
      let buildingName = null;
      let bname = null;
      if (user.buildingId) {
        const building = await this.buildingRepository.findOne({
          where: { id: user.buildingId },
        });
        buildingName = building?.name || null;
        bname = building?.bname || null;
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          phoneNumber: user.phoneNumber,
          buildingId: user.buildingId,
          buildingName,
          bname,
          dong: user.dong,
          ho: user.ho,
          buildingVerificationStatus: user.buildingVerificationStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      // 이미 UnauthorizedException이면 그대로 throw
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // 그 외의 에러는 로그하고 일반적인 에러 메시지 반환
      console.error('Login error:', error);
      throw new UnauthorizedException('로그인 중 오류가 발생했습니다.');
    }
  }

  /**
   * GPS 기반 건물 인증
   * 
   * 플로우:
   * 1. 건물 조회
   * 2. 건물에 좌표가 있으면 → 바로 비교
   * 3. 건물에 좌표가 없으면 → 카카오 로컬 API로 좌표 가져와서 업데이트 후 비교
   * 4. 100m 이내면 인증 성공
   */
  async verifyResidenceByGps(
    userId: number,
    dto: VerifyResidenceGpsDto,
  ) {
    // Rate limit 체크 (1분에 5회 제한)
    const rateLimitKey = `gps_verification:${userId}`;
    const canProceed = await this.redisCacheService.checkRateLimit(rateLimitKey, 5, 60);
    if (!canProceed) {
      throw new ConflictException('인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }

    // 1. 건물 조회
    let building = await this.buildingRepository.findOne({
      where: { id: dto.buildingId as any },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // 2. 건물에 좌표가 없으면 카카오 로컬 API로 주소로부터 좌표 가져와서 업데이트
    // (회원가입 시 좌표를 가져오지 못한 경우를 대비)
    if (!building.latitude || !building.longitude) {
      const address = building.roadAddress || building.jibunAddress;
      if (address) {
        try {
          this.logger.log(`건물 ID ${building.id}의 좌표가 없어 카카오 로컬 API로 좌표를 가져옵니다. 주소: ${address}`);
          this.logger.log(`건물 정보 - roadAddress: ${building.roadAddress}, jibunAddress: ${building.jibunAddress}`);
          
          // 카카오 로컬 API로 좌표 가져오기
          const coordinates = await this.kakaoLocalService.getCoordinatesFromAddress(address);
          if (coordinates && coordinates.latitude && coordinates.longitude) {
            // 건물 좌표 업데이트
            building.latitude = coordinates.latitude;
            building.longitude = coordinates.longitude;
            building = await this.buildingRepository.save(building);
            this.logger.log(`건물 ID ${building.id}의 좌표를 업데이트했습니다: ${coordinates.latitude}, ${coordinates.longitude}`);
          } else {
            // 좌표를 가져오지 못한 경우 - 더 자세한 에러 메시지
            const errorMsg = `주소 "${address}"의 좌표를 가져올 수 없습니다. 카카오 로컬 API에서 해당 주소를 찾을 수 없습니다. 주소 형식을 확인해주세요.`;
            this.logger.error(errorMsg);
            throw new NotFoundException(errorMsg);
          }
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          this.logger.error(`건물 위치 정보를 가져오는 중 오류 발생: ${error.message}`, error.stack);
          throw new NotFoundException(`건물 위치 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
        }
      } else {
        const errorMsg = `건물 ID ${building.id}의 주소 정보가 없습니다. roadAddress: ${building.roadAddress}, jibunAddress: ${building.jibunAddress}`;
        this.logger.error(errorMsg);
        throw new NotFoundException('건물 위치 정보가 없습니다. 관리자에게 문의해주세요.');
      }
    }

    // 3. 건물 위치와 사용자 위치 거리 계산
    const distance = this.calculateDistance(
      building.latitude,
      building.longitude,
      dto.latitude,
      dto.longitude,
    );

    // 4. 100m 이내면 인증 성공
    const isWithinRange = distance <= 0.2; // 200m
    
    this.logger.log(`GPS 인증 시도 - 사용자 ID: ${userId}, 건물 ID: ${building.id}, 거리: ${(distance * 1000).toFixed(2)}m, 결과: ${isWithinRange ? '성공' : '실패'}`);

    const verification = this.verificationRepository.create({
      userId,
      buildingId: dto.buildingId,
      verificationType: BuildingVerificationType.GPS,
      status: isWithinRange ? BuildingVerificationStatus.VERIFIED : BuildingVerificationStatus.REJECTED,
      gpsLatitude: dto.latitude,
      gpsLongitude: dto.longitude,
      verifiedAt: isWithinRange ? new Date() : null,
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    // 인증 성공 시 사용자 상태 업데이트 및 멤버십 생성
    if (isWithinRange) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.buildingVerificationStatus = BuildingVerificationStatus.VERIFIED;
        user.buildingId = dto.buildingId;
        await this.userRepository.save(user);
        
        // 건물 인증 완료 시 레벨 재계산
        await this.levelService.recalculateLevel(userId);
      }
      await this.createMembership(userId, dto.buildingId);
    }

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
      distance: distance * 1000, // km to m
    };
  }

  // GPS 거리 계산 (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // 지구 반경 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async verifyResidenceByInviteCode(
    userId: number,
    dto: VerifyResidenceInviteCodeDto,
  ) {
    const building = await this.buildingRepository.findOne({
      where: { id: dto.buildingId, inviteCode: dto.inviteCode },
    });

    if (!building) {
      throw new NotFoundException('건물 또는 초대 코드가 올바르지 않습니다.');
    }

    // 초대 코드 인증은 향후 구현 예정 (현재는 틀만)
    const verification = this.verificationRepository.create({
      userId,
      buildingId: dto.buildingId,
      verificationType: BuildingVerificationType.POST_MAIL, // 임시로 POST_MAIL 사용
      status: BuildingVerificationStatus.PENDING,
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
      message: '초대 코드 인증은 향후 구현 예정입니다.',
    };
  }

  async verifyResidenceByPostMail(
    userId: number,
    buildingId: number,
    photoUrl: string,
  ) {
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // 우편물 인증은 수동 승인 필요 (향후 구현 예정)
    const verification = this.verificationRepository.create({
      userId,
      buildingId,
      verificationType: BuildingVerificationType.POST_MAIL,
      status: BuildingVerificationStatus.PENDING,
      postMailPhotoUrl: photoUrl,
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
      message: '우편물 인증은 관리자 승인 후 완료됩니다.',
    };
  }

  async verifyResidenceByIdCard(
    userId: number,
    buildingId: number,
    idCardImage: Buffer,
  ) {
    // Rate limit 체크
    const rateLimitKey = `id_card_verification:${userId}`;
    const canProceed = await this.redisCacheService.checkRateLimit(rateLimitKey, 3, 60);
    if (!canProceed) {
      throw new ConflictException('인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }

    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // 주민등록증 처리 (OCR + 마스킹)
    // infrastructure 레이어의 IdCardProcessorService 사용
    const processedData = await this.idCardProcessorService.processIdCard(idCardImage);

    // 인증 임시 상태 캐싱 (검토용)
    await this.redisCacheService.setVerificationTempState(
      userId,
      BuildingVerificationType.ID_CARD,
      processedData,
      300, // 5분
    );

    // 주민등록증 인증은 수동 승인 필요 (PENDING 상태)
    const verification = this.verificationRepository.create({
      userId,
      buildingId,
      verificationType: BuildingVerificationType.ID_CARD,
      status: BuildingVerificationStatus.PENDING,
      idCardOcrResult: processedData.ocrResult, // 마스킹된 주민등록번호만 저장
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
      message: '주민등록증 인증은 관리자 승인 후 완료됩니다.',
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['memberships', 'memberships.building'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 모든 건물 멤버십 조회
    const buildings = user.memberships
      .filter((membership) => membership.status === MembershipStatus.ACTIVE)
      .map((membership) => ({
        id: membership.buildingId,
        name: membership.building?.name || '',
        nickname: user.nickname || '익명',
      }));

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      buildings,
      buildingId: user.buildingId || (buildings.length > 0 ? buildings[0].id : null),
      activityScore: user.activityScore || 0,
    };
  }

  // 닉네임은 변경 불가하므로 이 메서드는 제거하거나 에러를 반환
  async updateNickname(
    userId: number,
    buildingId: number,
    nickname: string,
  ) {
    throw new ConflictException('닉네임은 변경할 수 없습니다.');
  }

  private async createMembership(userId: number, buildingId: number) {
    const existingMembership = await this.membershipRepository.findOne({
      where: { userId, buildingId },
    });

    if (existingMembership) {
      if (existingMembership.status === MembershipStatus.INACTIVE) {
        existingMembership.status = MembershipStatus.ACTIVE;
        existingMembership.joinedAt = new Date();
        return await this.membershipRepository.save(existingMembership);
      }
      return existingMembership;
    }

    const membership = this.membershipRepository.create({
      userId,
      buildingId,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    });

    return await this.membershipRepository.save(membership);
  }

  /**
   * 이메일 인증 코드 발송
   */
  async sendEmailVerificationCode(email: string) {
    // Rate limit 체크 (1분에 3회 제한)
    const rateLimitKey = `email_verification:${email}`;
    const canProceed = await this.redisCacheService.checkRateLimit(rateLimitKey, 3, 60);
    if (!canProceed) {
      throw new ConflictException('인증 코드 발송 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }

    // 6자리 랜덤 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Redis에 인증 코드 저장 (3분 TTL)
    const cacheKey = `email_verification_code:${email}`;
    await this.redisCacheService.cacheManagerInstance.set(cacheKey, code, 180 * 1000);

    // 이메일 발송
    await this.emailService.sendVerificationCode(email, code);

    return {
      message: '인증 코드가 이메일로 발송되었습니다.',
    };
  }

  /**
   * 이메일 인증 코드 확인
   */
  async verifyEmailCode(email: string, code: string) {
    // Redis에서 인증 코드 조회
    const cacheKey = `email_verification_code:${email}`;
    const cachedCode = await this.redisCacheService.cacheManagerInstance.get<string>(cacheKey);

    if (!cachedCode || cachedCode !== code) {
      throw new UnauthorizedException('인증 코드가 올바르지 않거나 만료되었습니다.');
    }

    // 인증 성공 시 Redis에서 삭제
    await this.redisCacheService.cacheManagerInstance.del(cacheKey);

    return {
      verified: true,
      message: '이메일 인증이 완료되었습니다.',
    };
  }
}

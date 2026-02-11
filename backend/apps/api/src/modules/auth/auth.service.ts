import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';
import {
  ResidenceVerification,
  VerificationType,
  VerificationStatus,
} from './domain/entities/residence-verification.entity';
import { Building } from '../building/domain/entities/building.entity';
import { BuildingMembership, MembershipStatus } from '../building/domain/entities/building-membership.entity';
import { PasswordUtil } from '../../common/utils/password.util';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  VerifyResidenceGpsDto,
  VerifyResidenceInviteCodeDto,
} from './dto/verify-residence.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ResidenceVerification)
    private verificationRepository: Repository<ResidenceVerification>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await PasswordUtil.hash(signupDto.password);

    const user = this.userRepository.create({
      email: signupDto.email,
      password: hashedPassword,
      phoneNumber: signupDto.phoneNumber,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      userId: savedUser.id,
      message: '회원가입이 완료되었습니다.',
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
      if (user.buildingId) {
        const building = await this.buildingRepository.findOne({
          where: { id: user.buildingId },
        });
        buildingName = building?.name || null;
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
          dong: user.dong,
          ho: user.ho,
          isBuildingVerified: user.isBuildingVerified,
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

  async verifyResidenceByGps(
    userId: number,
    dto: VerifyResidenceGpsDto,
  ) {
    const building = await this.buildingRepository.findOne({
      where: { id: dto.buildingId as any },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // GPS 기반 인증은 자동 승인 (실제로는 거리 계산 로직 필요)
    const verification = this.verificationRepository.create({
      userId,
      buildingId: dto.buildingId,
      verificationType: VerificationType.GPS,
      status: VerificationStatus.APPROVED,
      gpsLatitude: dto.latitude,
      gpsLongitude: dto.longitude,
      verifiedAt: new Date(),
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    // 멤버십 생성
    await this.createMembership(userId, dto.buildingId);

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
    };
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

    const verification = this.verificationRepository.create({
      userId,
      buildingId: dto.buildingId,
      verificationType: VerificationType.INVITE_CODE,
      status: VerificationStatus.APPROVED,
      inviteCode: dto.inviteCode,
      verifiedAt: new Date(),
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    // 멤버십 생성
    await this.createMembership(userId, dto.buildingId);

    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
      buildingMembership: await this.membershipRepository.findOne({
        where: { userId, buildingId: dto.buildingId },
      }),
    };
  }

  async verifyResidenceByPhoto(
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

    const verification = this.verificationRepository.create({
      userId,
      buildingId,
      verificationType: VerificationType.PHOTO,
      status: VerificationStatus.PENDING,
      verificationPhotoUrl: photoUrl,
    });

    const savedVerification = await this.verificationRepository.save(
      verification,
    );

    // 사진 인증은 수동 승인 필요 (MVP에서는 PENDING 상태로 저장)
    return {
      verificationId: savedVerification.id,
      status: savedVerification.status,
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
    };
  }

  async updateNickname(
    userId: number,
    buildingId: number,
    nickname: string,
  ) {
    // 건물 멤버십 확인
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        buildingId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('해당 건물의 멤버가 아닙니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.nickname = nickname;
    const savedUser = await this.userRepository.save(user);

    return {
      nickname: savedUser.nickname,
    };
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
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Building, BuildingType } from './domain/entities/building.entity';
import { BuildingMembership, MembershipStatus } from './domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { InviteCodeUtil } from '../../common/utils/invite-code.util';
import { KakaoLocalService } from './services/kakao-local.service';
import { CreateBuildingDto } from './dto/create-building.dto';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);

  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private kakaoLocalService: KakaoLocalService,
  ) {}

  async searchBuildings(query: string) {
    const buildings = await this.buildingRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { roadAddress: Like(`%${query}%`) },
        { jibunAddress: Like(`%${query}%`) },
        { sido: Like(`%${query}%`) },
        { sigungu: Like(`%${query}%`) },
        { bname: Like(`%${query}%`) },
      ],
      take: 20,
    });

    return {
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        address: building.roadAddress || building.jibunAddress || `${building.sido || ''} ${building.sigungu || ''} ${building.bname || ''}`.trim(),
        buildingType: building.buildingType,
      })),
    };
  }

  async getBuildingById(buildingId: number, userId?: number) {
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('건물을 찾을 수 없습니다.');
    }

    // 멤버 수 계산
    const memberCount = await this.membershipRepository.count({
      where: {
        buildingId,
        status: MembershipStatus.ACTIVE,
      },
    });

    let isMember = false;
    if (userId) {
      const membership = await this.membershipRepository.findOne({
        where: {
          userId,
          buildingId,
          status: MembershipStatus.ACTIVE,
        },
      });
      isMember = !!membership;
    }

    return {
      id: building.id,
      name: building.name,
      roadAddress: building.roadAddress,
      jibunAddress: building.jibunAddress,
      sido: building.sido,
      sigungu: building.sigungu,
      bname: building.bname,
      buildingType: building.buildingType,
      totalHouseholds: building.totalHouseholds,
      memberCount,
      isMember,
    };
  }

  async getMyBuildings(userId: number) {
    const memberships = await this.membershipRepository.find({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      relations: ['building'],
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const buildings = memberships.map((membership) => ({
      id: membership.building.id,
      name: membership.building.name,
      address: membership.building.roadAddress || membership.building.jibunAddress || `${membership.building.sido || ''} ${membership.building.sigungu || ''} ${membership.building.bname || ''}`.trim(),
      joinedAt: membership.joinedAt,
      nickname: user?.nickname || null,
    }));

    return { buildings };
  }

  /**
   * 건물 생성
   * 
   * 플로우:
   * 1. 카카오 우편번호 서비스 데이터로 건물 정보 저장
   * 2. 좌표가 제공되지 않았으면 카카오 로컬 API로 주소로부터 좌표 가져오기
   * 3. 건물 저장
   * 
   * 회원가입 시 건물이 없을 때 호출됨
   */
  async createBuilding(data: CreateBuildingDto) {
    const inviteCode = InviteCodeUtil.generate();

    // 위도/경도가 제공되지 않았으면 카카오 로컬 API로 주소로부터 좌표 가져오기
    let latitude = data.latitude;
    let longitude = data.longitude;

    if (!latitude || !longitude) {
      // 도로명 주소 우선, 없으면 지번 주소 사용
      const address = data.roadAddress || data.jibunAddress;
      if (address) {
        this.logger.log(`건물 생성 시 좌표를 가져옵니다. 주소: ${address}`);
        const coordinates = await this.kakaoLocalService.getCoordinatesFromAddress(address);
        if (coordinates) {
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;
          this.logger.log(`건물 좌표를 가져왔습니다: ${latitude}, ${longitude}`);
        } else {
          // 좌표를 가져오지 못한 경우 에러 발생
          throw new NotFoundException(`주소 "${address}"의 좌표를 가져올 수 없습니다. 주소를 확인해주세요.`);
        }
      } else {
        // 주소가 없는 경우 에러 발생
        throw new NotFoundException('건물 주소 정보가 없어 좌표를 가져올 수 없습니다.');
      }
    }

    // 좌표가 여전히 없으면 에러
    if (!latitude || !longitude) {
      throw new NotFoundException('건물 좌표 정보를 가져올 수 없습니다. 주소를 확인해주세요.');
    }

    this.logger.log(`건물 생성: ${data.name}, 주소: ${data.roadAddress || data.jibunAddress}, 좌표: ${latitude}, ${longitude}`);

    // 카카오 우편번호 서비스 데이터로 건물 정보 구성 (실제 사용되는 필드만)
    const buildingData: any = {
      name: data.name,
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
      bname: data.bname,
      sido: data.sido,
      sigungu: data.sigungu,
      latitude: latitude,
      longitude: longitude,
      buildingType: data.buildingType as BuildingType,
      totalHouseholds: data.totalHouseholds,
      inviteCode,
      isActive: true,
    };

    const building = this.buildingRepository.create(buildingData);

    const savedBuilding = await this.buildingRepository.save(building) as unknown as Building;
    this.logger.log(`건물 저장 완료: ID=${savedBuilding.id}, 좌표=${savedBuilding.latitude}, ${savedBuilding.longitude}`);
    
    return savedBuilding;
  }
}

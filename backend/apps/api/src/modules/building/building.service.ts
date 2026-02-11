import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Building, BuildingType } from './domain/entities/building.entity';
import { BuildingMembership, MembershipStatus } from './domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { InviteCodeUtil } from '../../common/utils/invite-code.util';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async searchBuildings(query: string) {
    const buildings = await this.buildingRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { roadAddress: Like(`%${query}%`) },
        { lotAddress: Like(`%${query}%`) },
        { city: Like(`%${query}%`) },
        { district: Like(`%${query}%`) },
        { neighborhood: Like(`%${query}%`) },
      ],
      take: 20,
    });

    return {
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        address: building.roadAddress || building.lotAddress || `${building.city} ${building.district} ${building.neighborhood}`,
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
      lotAddress: building.lotAddress,
      city: building.city,
      district: building.district,
      neighborhood: building.neighborhood,
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
      address: membership.building.roadAddress || membership.building.lotAddress || `${membership.building.city} ${membership.building.district} ${membership.building.neighborhood}`,
      joinedAt: membership.joinedAt,
      nickname: user?.nickname || null,
    }));

    return { buildings };
  }

  async createBuilding(data: {
    name: string;
    roadAddress?: string;
    lotAddress?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    buildingType?: string;
    totalHouseholds?: number;
  }) {
    const inviteCode = InviteCodeUtil.generate();

    const building = this.buildingRepository.create({
      name: data.name,
      roadAddress: data.roadAddress,
      lotAddress: data.lotAddress,
      city: data.city,
      district: data.district,
      neighborhood: data.neighborhood,
      latitude: data.latitude,
      longitude: data.longitude,
      buildingType: data.buildingType as BuildingType,
      totalHouseholds: data.totalHouseholds,
      inviteCode,
      isActive: true,
    });

    return await this.buildingRepository.save(building);
  }
}

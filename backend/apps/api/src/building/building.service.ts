import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BuildingEntity } from '@infrastructure/building/persistence/building.entity';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(BuildingEntity)
    private buildingRepository: Repository<BuildingEntity>,
  ) {}

  // 모든 건물 조회
  async findAll() {
    return this.buildingRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  // 건물 검색 (이름, 주소로)
  async search(keyword: string) {
    const qb = this.buildingRepository.createQueryBuilder('building');
    
    qb.where('building.isActive = :isActive', { isActive: true })
      .andWhere(
        '(building.name LIKE :keyword OR ' +
        'building.roadAddress LIKE :keyword OR ' +
        'building.lotAddress LIKE :keyword OR ' +
        'building.district LIKE :keyword OR ' +
        'building.neighborhood LIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .orderBy('building.userCount', 'DESC')
      .addOrderBy('building.name', 'ASC')
      .take(20);

    return qb.getMany();
  }

  // 특정 건물 조회
  async findOne(id: number) {
    return this.buildingRepository.findOne({
      where: { id, isActive: true },
    });
  }

  // 지역별 건물 조회
  async findByLocation(city?: string, district?: string, neighborhood?: string) {
    const where: any = { isActive: true };
    
    if (city) where.city = city;
    if (district) where.district = district;
    if (neighborhood) where.neighborhood = neighborhood;

    return this.buildingRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  // 건물 생성 (관리자용)
  async create(data: Partial<BuildingEntity>) {
    const building = this.buildingRepository.create(data);
    return this.buildingRepository.save(building);
  }

  // 입주민 수 증가
  async incrementUserCount(buildingId: number) {
    await this.buildingRepository.increment({ id: buildingId }, 'userCount', 1);
  }

  // 입주민 수 감소
  async decrementUserCount(buildingId: number) {
    await this.buildingRepository.decrement({ id: buildingId }, 'userCount', 1);
  }
}

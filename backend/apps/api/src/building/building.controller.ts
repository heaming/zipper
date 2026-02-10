import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  // 모든 건물 조회
  @Get()
  async findAll() {
    return this.buildingService.findAll();
  }

  // 건물 검색
  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword) {
      return [];
    }
    return this.buildingService.search(keyword);
  }

  // 지역별 건물 조회
  @Get('by-location')
  async findByLocation(
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('neighborhood') neighborhood?: string,
  ) {
    return this.buildingService.findByLocation(city, district, neighborhood);
  }

  // 특정 건물 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.buildingService.findOne(+id);
  }

  // 건물 등록 (관리자용 - 추후 인증 추가)
  @Post()
  async create(@Body() dto: CreateBuildingDto) {
    return this.buildingService.create(dto);
  }
}

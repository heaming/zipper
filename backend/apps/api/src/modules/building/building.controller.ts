import { Controller, Get, Query, Param, UseGuards, Post, Body } from '@nestjs/common';
import { BuildingService } from './building.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateBuildingDto } from './dto/create-building.dto';

@Controller('api/buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Public()
  @Get('search')
  async searchBuildings(@Query('q') query: string) {
    return this.buildingService.searchBuildings(query);
  }

  @Public()
  @Post()
  async createBuilding(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.createBuilding(createBuildingDto);
  }

  @Get(':id')
  async getBuilding(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    return this.buildingService.getBuildingById(parseInt(id), user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyBuildings(@CurrentUser() user: any) {
    return this.buildingService.getMyBuildings(user.id);
  }
}

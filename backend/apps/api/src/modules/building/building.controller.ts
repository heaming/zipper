import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { BuildingService } from './building.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Public()
  @Get('search')
  async searchBuildings(@Query('q') query: string) {
    return this.buildingService.searchBuildings(query);
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

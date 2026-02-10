import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { BuildingEntity } from '@infrastructure/building/persistence/building.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BuildingEntity])],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}

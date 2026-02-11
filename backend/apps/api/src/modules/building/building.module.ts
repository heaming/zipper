import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { Building } from './domain/entities/building.entity';
import { BuildingMembership } from './domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, BuildingMembership, User]),
  ],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}

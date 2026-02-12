import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { KakaoLocalService } from './services/kakao-local.service';
import { Building } from './domain/entities/building.entity';
import { BuildingMembership } from './domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, BuildingMembership, User]),
  ],
  controllers: [BuildingController],
  providers: [BuildingService, KakaoLocalService],
  exports: [BuildingService, KakaoLocalService], // KakaoLocalService도 export하여 다른 모듈에서 사용 가능하도록
})
export class BuildingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { HotPostService } from './services/hot-post.service';
import { ViewCountService } from './services/view-count.service';
import { Post } from './domain/entities/post.entity';
import { PostLike } from './domain/entities/post-like.entity';
import { Comment } from './domain/entities/comment.entity';
import { Report } from './domain/entities/report.entity';
import { BuildingMembership } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { Building } from '../building/domain/entities/building.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostLike,
      Comment,
      Report,
      BuildingMembership,
      User,
      Building,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, HotPostService, ViewCountService],
  exports: [CommunityService, HotPostService],
})
export class CommunityModule {}

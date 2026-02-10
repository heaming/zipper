import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PostEntity } from '@infrastructure/community/persistence/post.entity';
import { CommentEntity } from '@infrastructure/community/persistence/comment.entity';
import { LikeEntity } from '@infrastructure/community/persistence/like.entity';
import { UserEntity } from '@infrastructure/auth/persistence/user.entity';
import { BuildingEntity } from '@infrastructure/building/persistence/building.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      CommentEntity,
      LikeEntity,
      UserEntity,
      BuildingEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}

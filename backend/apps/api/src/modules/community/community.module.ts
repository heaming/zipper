import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { HotPostService } from './services/hot-post.service';
import { ViewCountService } from './services/view-count.service';
import { Post } from './domain/entities/post.entity';
import { PostImage } from './domain/entities/post-image.entity';
import { PostMeta } from './domain/entities/post-meta.entity';
import { PostLike } from './domain/entities/post-like.entity';
import { Comment } from './domain/entities/comment.entity';
import { Report } from './domain/entities/report.entity';
import { BuildingMembership } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { Building } from '../building/domain/entities/building.entity';
import { PostRepository } from './infrastructure/repositories/post.repository';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { GetPostsUseCase } from './application/usecases/get-posts.usecase';
import { LocalImageStorage } from './infrastructure/storage/local-image-storage';
import { S3ImageStorage } from './infrastructure/storage/s3-image-storage';
import { ImageStorageFactory } from './infrastructure/storage/image-storage.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostImage,
      PostMeta,
      PostLike,
      Comment,
      Report,
      BuildingMembership,
      User,
      Building,
    ]),
  ],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    HotPostService,
    ViewCountService,
    PostRepository,
    CreatePostUseCase,
    GetPostsUseCase,
    LocalImageStorage,
    S3ImageStorage,
    ImageStorageFactory,
  ],
  exports: [CommunityService, HotPostService],
})
export class CommunityModule {}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BoardType } from './domain/entities/post.entity';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { GetPostsUseCase } from './application/usecases/get-posts.usecase';
import { ImageStorageFactory } from './infrastructure/storage/image-storage.factory';
import { multerConfig } from '../../common/config/multer.config';

@Controller('api/community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getPostsUseCase: GetPostsUseCase,
    private readonly imageStorageFactory: ImageStorageFactory,
  ) {}

  @Get('posts/hot')
  async getHotPosts(
    @Query('buildingId') buildingId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.getHotPosts(buildingId, user.id);
  }

  @Get('posts/:id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.getPostById(id, user.id);
  }

  @Get('posts')
  async getPosts(
    @CurrentUser() user: any,
    @Query('boardType') boardType?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    // buildingId는 클라이언트에서 받지 않고, 사용자 멤버십에서 추출
    return this.getPostsUseCase.execute(user.id, {
      boardType: boardType as BoardType | undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Post('posts/:id/view')
  async incrementView(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.incrementView(id, user.id);
  }

  /**
   * 이미지 업로드 API
   * 게시글 작성 전에 이미지를 먼저 업로드하고 URL을 받아옴
   */
  @Post('images/upload')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  async uploadImages(@UploadedFiles() files: Array<any>) {
    if (!files || files.length === 0) {
      throw new Error('이미지 파일이 필요합니다.');
    }

    try {
      const storage = this.imageStorageFactory.getStorage();
      const imageUrls = await storage.uploadImages(files, 'posts');

      return {
        imageUrls,
      };
    } catch (error) {
      console.error('[CommunityController] Image upload error:', error);
      throw error;
    }
  }

  @Post('posts')
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    // buildingId는 클라이언트에서 받지 않고, 사용자 멤버십에서 추출
    return this.createPostUseCase.execute(user.id, dto);
  }

  @Put('posts/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.communityService.updatePost(id, user.id, dto);
  }

  @Delete('posts/:id')
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.deletePost(id, user.id);
  }

  @Post('posts/:postId/like')
  async togglePostLike(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.togglePostLike(postId, user.id);
  }

  @Delete('posts/:postId/like')
  async removePostLike(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.togglePostLike(postId, user.id);
  }

  @Get('posts/:postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @CurrentUser() user: any,
  ) {
    return this.communityService.getComments(
      postId,
      user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post('posts/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.communityService.createComment(postId, user.id, dto);
  }

  @Put('comments/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @CurrentUser() user: any,
  ) {
    return this.communityService.updateComment(id, user.id, body.content);
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.deleteComment(id, user.id);
  }

  @Post('comments/:id/like')
  async toggleCommentLike(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.toggleCommentLike(id, user.id);
  }

  // 내 활동 내역 API
  @Get('activity/posts')
  async getMyPosts(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.communityService.getMyPosts(
      user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('activity/comments')
  async getMyComments(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.communityService.getMyComments(
      user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('activity/likes')
  async getMyLikedPosts(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.communityService.getMyLikedPosts(
      user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post('posts/:postId/join')
  async joinTogatherPost(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.joinTogatherPost(postId, user.id);
  }
}

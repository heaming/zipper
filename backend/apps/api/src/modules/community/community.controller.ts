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
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BoardType } from './domain/entities/post.entity';

@Controller('api/community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  async getPosts(
    @CurrentUser() user: any,
    @Query('buildingId') buildingId: string,
    @Query('boardType') boardType?: BoardType,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.communityService.getPosts(
      buildingId,
      user.id,
      boardType,
      parseInt(page),
      parseInt(limit),
    );
  }

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

  @Post('posts')
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.communityService.createPost(user.id, dto);
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
}

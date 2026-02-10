import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // 게시글 목록 조회 (인증 필요 - 건물별 필터링)
  @Get('posts')
  async getPosts(
    @CurrentUser() user: any,
    @Query('boardType') boardType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getPosts(user.id, boardType, parseInt(limit) || 20);
  }

  // 게시글 상세 조회 (인증 필요 - 건물 접근 권한 확인)
  @Get('posts/:id')
  async getPost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.communityService.getPost(+id, user.id);
  }

  // 댓글 목록 조회
  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.communityService.getComments(+postId);
  }

  // 좋아요 수 조회
  @Get('posts/:postId/likes')
  async getLikes(@Param('postId') postId: string) {
    return this.communityService.getLikes(+postId, 'post');
  }
}

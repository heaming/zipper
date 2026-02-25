import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { BoardType, PostStatus } from '../../domain/entities/post.entity';
import { BuildingMembership, MembershipStatus } from '../../../building/domain/entities/building-membership.entity';

/**
 * GetPostsUseCase
 * 
 * 비즈니스 로직:
 * 1. 사용자의 buildingId를 멤버십에서 추출
 * 2. buildingId 필터를 강제하여 조회 (멀티테넌시 격리)
 * 3. tag 필터 optional
 * 4. pagination 포함
 */
@Injectable()
export class GetPostsUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    @InjectRepository(BuildingMembership)
    private readonly membershipRepository: Repository<BuildingMembership>,
  ) {}

  async execute(
    userId: number,
    options: {
      boardType?: BoardType;
      page?: number;
      limit?: number;
    } = {},
  ) {
    // 1. 사용자의 buildingId를 멤버십에서 추출
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      order: {
        joinedAt: 'DESC',
      },
    });

    if (!membership) {
      throw new NotFoundException('활성화된 빌딩 멤버십이 없습니다.');
    }

    const buildingId = membership.buildingId;

    // 2. buildingId 필터를 강제하여 조회 (서버에서 격리)
    // boardType을 BoardType enum으로 변환
    const boardType = options.boardType ? this.mapBoardTypeToEnum(options.boardType) : undefined;
    
    const { posts, total } = await this.postRepository.findByBuilding(buildingId, {
      boardType,
      status: PostStatus.ACTIVE,
      page: options.page || 1,
      limit: options.limit || 20,
    });

    // 3. 응답 데이터 변환
    return {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        boardType: post.boardType,
        author: {
          id: post.author?.id,
          nickname: post.author?.nickname || '익명',
        },
        buildingId: post.buildingId,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        viewCount: post.viewCount,
        imageUrls: post.images?.map((img) => img.imageUrl) || [],
        meta: post.meta?.[0] ? {
          price: post.meta[0].price,
          quantity: post.meta[0].quantity,
          deadline: post.meta[0].deadline,
          locationDetail: post.meta[0].locationDetail,
        } : null,
        createdAt: post.createdAt,
      })),
      total,
      page: options.page || 1,
      limit: options.limit || 20,
    };
  }

  /**
   * 문자열 boardType을 BoardType enum으로 변환
   */
  private mapBoardTypeToEnum(boardType: BoardType | string): BoardType {
    if (typeof boardType === 'string') {
      const boardTypeMap: Record<string, BoardType> = {
        togather: BoardType.TOGATHER,
        share: BoardType.SHARE,
        lifestyle: BoardType.LIFESTYLE,
        chat: BoardType.CHAT,
        market: BoardType.MARKET,
      };

      const enumValue = boardTypeMap[boardType.toLowerCase()];
      if (!enumValue) {
        return boardType as BoardType; // 이미 enum인 경우
      }
      return enumValue;
    }
    return boardType;
  }
}

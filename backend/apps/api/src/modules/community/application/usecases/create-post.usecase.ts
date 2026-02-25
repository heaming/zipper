import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { Post, BoardType, PostStatus } from '../../domain/entities/post.entity';
import { BuildingMembership, MembershipStatus } from '../../../building/domain/entities/building-membership.entity';
import { User } from '../../../auth/domain/entities/user.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostCreatedEvent } from '../../../auth/events/activity.events';

/**
 * CreatePostUseCase
 * 
 * 비즈니스 로직:
 * 1. 사용자의 buildingId를 멤버십에서 추출 (클라이언트에서 받지 않음)
 * 2. MARKET 태그일 경우 권한 검증
 * 3. 이미지 배열을 PostImage 테이블에 저장
 * 4. meta 데이터를 PostMeta 테이블에 저장
 */
@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    @InjectRepository(BuildingMembership)
    private readonly membershipRepository: Repository<BuildingMembership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: number, dto: CreatePostDto): Promise<{ id: number; title: string; createdAt: Date }> {
    // 1. 사용자의 buildingId를 멤버십에서 추출
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      order: {
        joinedAt: 'DESC', // 가장 최근에 가입한 빌딩 우선
      },
    });

    if (!membership) {
      throw new NotFoundException('활성화된 빌딩 멤버십이 없습니다.');
    }

    const buildingId = membership.buildingId;

    // 2. 사용자 정보 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 3. MARKET 태그일 경우 권한 검증 (Service 레벨에서 수행)
    const boardTypeLower = dto.boardType.toLowerCase();
    if (boardTypeLower === 'market') {
      await this.verifyMarketPermission(userId);
    }

    // 4. Post 생성
    // boardType을 BoardType enum으로 변환
    const boardType = this.mapBoardTypeToEnum(dto.boardType);
    
    const post = await this.postRepository.create({
      authorId: userId,
      buildingId,
      boardType,
      title: dto.title,
      content: dto.content,
      status: PostStatus.ACTIVE,
      isCommercial: boardType === BoardType.MARKET,
    });

    // 5. 이미지 저장
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      await this.postRepository.saveImages(post.id, dto.imageUrls);
    }

    // 6. Meta 데이터 저장 (공동구매/마켓 확장 고려)
    if (dto.meta) {
      await this.postRepository.saveMeta(post.id, {
        price: dto.meta.price,
        quantity: dto.meta.quantity,
        deadline: dto.meta.deadline ? new Date(dto.meta.deadline) : undefined,
        locationDetail: dto.meta.locationDetail,
        extraData: dto.meta.extraData,
      });
    }

    // 7. 활동 점수 이벤트 발행
    this.eventEmitter.emit('post.created', new PostCreatedEvent(userId));

    return {
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
    };
  }

  /**
   * MARKET 태그 권한 검증
   * Service 레벨에서 수행 (Controller가 아님)
   */
  private async verifyMarketPermission(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // MARKET 권한 검증 로직
    // 예: 레벨 3 이상이거나 특정 권한이 있어야 함
    // 현재는 기본적으로 레벨 체크만 수행
    if (user.level < 3) {
      throw new ForbiddenException('ZIP 마켓 게시글 작성 권한이 없습니다. 레벨 3 이상이 필요합니다.');
    }

    // TODO: 향후 더 세밀한 권한 체크 로직 추가 가능
    // 예: 특정 역할(role) 체크, 관리자 승인 여부 등
  }

  /**
   * 문자열 boardType을 BoardType enum으로 변환
   */
  private mapBoardTypeToEnum(boardType: string): BoardType {
    const boardTypeMap: Record<string, BoardType> = {
      togather: BoardType.TOGATHER,
      share: BoardType.SHARE,
      lifestyle: BoardType.LIFESTYLE,
      chat: BoardType.CHAT,
      market: BoardType.MARKET,
    };

    const enumValue = boardTypeMap[boardType.toLowerCase()];
    if (!enumValue) {
      throw new BadRequestException(`Invalid boardType: ${boardType}`);
    }

    return enumValue;
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Post, BoardType } from './domain/entities/post.entity';
import { PostLike } from './domain/entities/post-like.entity';
import { Comment } from './domain/entities/comment.entity';
import { PostImage } from './domain/entities/post-image.entity';
import { BuildingMembership, MembershipStatus } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { BuildingVerificationStatus } from '../auth/domain/entities/building-verification.entity';
import { HotPostService } from './services/hot-post.service';
import { ViewCountService } from './services/view-count.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  PostCreatedEvent,
  CommentCreatedEvent,
  PostLikedEvent,
} from '../auth/events/activity.events';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(BuildingMembership)
    private membershipRepository: Repository<BuildingMembership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PostImage)
    private postImageRepository: Repository<PostImage>,
    private hotPostService: HotPostService,
    private viewCountService: ViewCountService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getPosts(
    buildingId: string,
    userId: string,
    boardType?: BoardType,
    page: number = 1,
    limit: number = 20,
  ) {
    this.logger.log(`[getPosts] Called with buildingId: ${buildingId}, userId: ${userId}, boardType: ${boardType}, page: ${page}, limit: ${limit}`);
    
    if (!buildingId) {
      this.logger.error('[getPosts] buildingId is required');
      throw new Error('buildingId is required');
    }
    
    const buildingIdNum = parseInt(buildingId, 10);
    if (isNaN(buildingIdNum)) {
      this.logger.error(`[getPosts] Invalid buildingId: ${buildingId}`);
      throw new Error(`Invalid buildingId: ${buildingId}`);
    }
    
    const userIdNum = parseInt(userId, 10);
    this.logger.log(`[getPosts] Parsed buildingId: ${buildingIdNum}, userId: ${userIdNum}`);
    
    // 멤버십 확인
    await this.verifyMembership(userIdNum, buildingIdNum);
    this.logger.log(`[getPosts] Membership verified`);

    // QueryBuilder를 사용하여 명시적으로 buildingId 필터링
    // buildingId를 명시적으로 숫자로 변환하여 비교
    this.logger.log(`[getPosts] Starting query with buildingId: ${buildingIdNum}, userId: ${userIdNum}, boardType: ${boardType || 'all'}`);
    
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.buildingId = :buildingId', { buildingId: buildingIdNum })
      .andWhere('post.deletedAt IS NULL');

    if (boardType) {
      queryBuilder.andWhere('post.boardType = :boardType', { boardType });
    }

    queryBuilder
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.images', 'images')
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('images.orderIndex', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    // 디버깅: 생성된 SQL 쿼리 확인
    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    this.logger.log(`[getPosts] SQL Query: ${sql}`);
    this.logger.log(`[getPosts] Parameters: ${JSON.stringify(params)}`);

    const [posts, total] = await queryBuilder.getManyAndCount();
    
    // 디버깅: 조회된 게시글의 buildingId 확인
    this.logger.log(`[getPosts] Found ${posts.length} posts out of ${total} total`);
    if (posts.length > 0) {
      this.logger.log(`[getPosts] First few posts: ${JSON.stringify(posts.slice(0, 3).map(p => ({ id: p.id, buildingId: p.buildingId, title: p.title.substring(0, 20) })))}`);
    }

    // buildingId 검증: 모든 게시글이 요청한 buildingId와 일치하는지 확인
    const invalidPosts = posts.filter(post => post.buildingId !== buildingIdNum);
    if (invalidPosts.length > 0) {
      this.logger.error(`[getPosts] Invalid buildingId detected! Requested: ${buildingIdNum}, Found posts with buildingIds: ${JSON.stringify(invalidPosts.map(p => ({ id: p.id, buildingId: p.buildingId })))}`);
      // 잘못된 buildingId를 가진 게시글 제거
      const validPosts = posts.filter(post => post.buildingId === buildingIdNum);
      return {
        posts: [],
        total: validPosts.length,
        page,
        limit,
      };
    }

    // 작성자 닉네임 조회
    const postsWithNicknames = await Promise.all(
      posts.map(async (post) => {
        // buildingId 검증
        if (post.buildingId !== buildingIdNum) {
          this.logger.error(`[getPosts] Post ${post.id} has wrong buildingId: ${post.buildingId}, expected: ${buildingIdNum}`);
          return null;
        }

        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });

        const isLiked = await this.postLikeRepository.findOne({
          where: {
            postId: post.id,
            userId: userIdNum,
          },
        });

        // 이미지 URL 배열 추출 (orderIndex 순서대로)
        const imageUrls = post.images
          ? post.images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((img) => img.imageUrl)
          : [];

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls,
          author: {
            id: post.authorId,
            nickname: author?.nickname || '익명',
          },
          boardType: post.boardType,
          buildingId: post.buildingId, // 디버깅을 위해 buildingId도 반환
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          viewCount: post.viewCount,
          isHot: post.isHot,
          createdAt: post.createdAt,
        };
      }),
    );

    // null 값 제거 (buildingId가 일치하지 않는 게시글)
    const validPosts = postsWithNicknames.filter(post => post !== null);

    return {
      posts: validPosts,
      total: validPosts.length,
      page,
      limit,
    };
  }

  async getHotPosts(buildingId: string, userId: string) {
    const buildingIdNum = parseInt(buildingId, 10);
    const userIdNum = parseInt(userId, 10);
    
    await this.verifyMembership(userIdNum, buildingIdNum);

    const hotPosts = await this.hotPostService.getHotPosts(buildingIdNum, 10);

    const postsWithNicknames = await Promise.all(
      hotPosts.map(async (post) => {
        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });

        // 이미지 URL 배열 추출 (orderIndex 순서대로)
        const imageUrls = post.images
          ? post.images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((img) => img.imageUrl)
          : [];

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls,
          author: {
            id: post.authorId,
            nickname: author?.nickname || '익명',
          },
          boardType: post.boardType,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          viewCount: post.viewCount,
          isHot: post.isHot,
          createdAt: post.createdAt,
        };
      }),
    );

    return { posts: postsWithNicknames };
  }

  async getPostById(postId: string, userId: string) {
    const postIdNum = parseInt(postId, 10);
    if (isNaN(postIdNum)) {
      throw new NotFoundException('잘못된 게시글 ID입니다.');
    }
    
    const userIdNum = parseInt(userId, 10);
    
    // QueryBuilder를 사용하여 명시적으로 ID로 조회
    const post = await this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :postId', { postId: postIdNum })
      .andWhere('post.deletedAt IS NULL')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.building', 'building')
      .leftJoinAndSelect('post.images', 'images')
      .orderBy('images.orderIndex', 'ASC')
      .getOne();

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 디버깅: 실제 조회된 데이터 확인
    this.logger.log(`[getPostById] Requested postId: ${postIdNum}, Found post: ${JSON.stringify({
      id: post.id,
      title: post.title,
      buildingId: post.buildingId,
      authorId: post.authorId,
      boardType: post.boardType,
      imagesCount: post.images?.length || 0,
    })}`);

    // 인증 상태 확인: VERIFIED가 아니면 상세 조회 불가
    const user = await this.userRepository.findOne({
      where: { id: userIdNum },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.buildingVerificationStatus !== BuildingVerificationStatus.VERIFIED) {
      throw new ForbiddenException('건물 인증을 완료해야 게시글을 조회할 수 있습니다.');
    }

    await this.verifyMembership(userIdNum, post.buildingId);

    // 조회수 증가 (Redis를 사용한 중복 방지)
    const canIncrement = await this.viewCountService.canIncrementView(postIdNum, userIdNum);
    if (canIncrement) {
      post.viewCount += 1;
      await this.postRepository.save(post);
    }

    const author = await this.userRepository.findOne({
      where: { id: post.authorId },
    });

    const isLiked = await this.postLikeRepository.findOne({
      where: {
        postId: post.id,
        userId: userIdNum,
      },
    });

    // 응답 데이터 검증
    if (post.id !== postIdNum) {
      this.logger.error(`[getPostById] Post ID mismatch! Requested: ${postIdNum}, Found: ${post.id}`);
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 이미지 URL 배열 추출 (orderIndex 순서대로)
    const imageUrls = post.images && Array.isArray(post.images) && post.images.length > 0
      ? post.images
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map((img) => img.imageUrl)
          .filter((url) => url) // 빈 URL 제거
      : [];
    
    this.logger.log(`[getPostById] Extracted imageUrls: ${JSON.stringify(imageUrls)}`);

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrls,
      author: {
        id: post.authorId,
        nickname: author?.nickname || '익명',
      },
      boardType: post.boardType,
      buildingId: post.buildingId, // 디버깅을 위해 buildingId도 반환
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount,
      isLiked: !!isLiked,
      isHot: post.isHot,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async incrementView(postId: string, userId: string) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userIdNum, post.buildingId);

    // 조회수 증가 (Redis를 사용한 중복 방지)
    const canIncrement = await this.viewCountService.canIncrementView(postIdNum, userIdNum);
    if (canIncrement) {
      post.viewCount += 1;
      await this.postRepository.save(post);
    }

    return {
      viewCount: post.viewCount,
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const userIdNum = parseInt(userId, 10);
    
    // 사용자의 buildingId를 멤버십에서 추출
    const membership = await this.membershipRepository.findOne({
      where: {
        userId: userIdNum,
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
    await this.verifyMembership(userIdNum, buildingId);

    // boardType을 BoardType enum으로 변환
    const boardTypeEnum = dto.boardType.toLowerCase() as BoardType;
    if (!Object.values(BoardType).includes(boardTypeEnum)) {
      throw new NotFoundException(`Invalid boardType: ${dto.boardType}`);
    }

    const post = this.postRepository.create({
      authorId: userIdNum,
      buildingId,
      boardType: boardTypeEnum,
      title: dto.title,
      content: dto.content,
    });

    const savedPost = await this.postRepository.save(post);

    // 이미지 저장
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      const images = dto.imageUrls.map((url, index) =>
        this.postImageRepository.create({
          postId: savedPost.id,
          imageUrl: url,
          orderIndex: index,
        }),
      );
      await this.postImageRepository.save(images);
    }

    // 활동 점수 이벤트 발행
    this.eventEmitter.emit('post.created', new PostCreatedEvent(userIdNum));

    return {
      id: savedPost.id,
      title: savedPost.title,
      createdAt: savedPost.createdAt,
    };
  }

  async updatePost(postId: string, userId: string, dto: UpdatePostDto) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.authorId !== userIdNum) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    if (dto.title) post.title = dto.title;
    if (dto.content) post.content = dto.content;
    
    // 이미지 업데이트
    if (dto.imageUrls) {
      // 기존 이미지 삭제
      await this.postImageRepository.delete({ postId: postIdNum });
      
      // 새 이미지 저장
      if (dto.imageUrls.length > 0) {
        const images = dto.imageUrls.map((url, index) =>
          this.postImageRepository.create({
            postId: postIdNum,
            imageUrl: url,
            orderIndex: index,
          }),
        );
        await this.postImageRepository.save(images);
      }
    }

    const updatedPost = await this.postRepository.save(post);

    return {
      id: updatedPost.id,
      updatedAt: updatedPost.updatedAt,
    };
  }

  async deletePost(postId: string, userId: string) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.authorId !== userIdNum) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.postRepository.softDelete(postIdNum);

    return { message: '게시글이 삭제되었습니다.' };
  }

  async togglePostLike(postId: string, userId: string) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: { postId: postIdNum, userId: userIdNum },
    });

    if (existingLike) {
      await this.postLikeRepository.remove(existingLike);
      post.likeCount = Math.max(0, post.likeCount - 1);
      await this.postRepository.save(post);
      return { isLiked: false, likeCount: post.likeCount };
    } else {
      const like = this.postLikeRepository.create({ postId: postIdNum, userId: userIdNum });
      await this.postLikeRepository.save(like);
      post.likeCount += 1;
      await this.postRepository.save(post);
      
      // 활동 점수 이벤트 발행 (게시글 작성자가 좋아요 받음)
      this.eventEmitter.emit('post.liked', new PostLikedEvent(post.authorId));
      
      return { isLiked: true, likeCount: post.likeCount };
    }
  }

  async getComments(postId: string, userId: string, page: number = 1, limit: number = 50) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId: postIdNum, parentCommentId: null, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
      withDeleted: false,
    });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        // users 테이블에서 닉네임 가져오기
        const author = await this.userRepository.findOne({
          where: { id: comment.authorId },
        });
        const authorNickname = author?.nickname || '익명';

        // 댓글 좋아요 기능은 없음
        const isLiked = false;

        // 대댓글 조회
        const replies = await this.commentRepository.find({
          where: { parentCommentId: comment.id, deletedAt: IsNull() },
          order: { createdAt: 'ASC' },
          relations: ['author'],
          withDeleted: false,
        });

        const repliesWithNicknames = await Promise.all(
          replies.map(async (reply) => {
            // users 테이블에서 닉네임 가져오기
            const replyAuthor = await this.userRepository.findOne({
              where: { id: reply.authorId },
            });
            const replyNickname = replyAuthor?.nickname || '익명';

            // 댓글 좋아요 기능은 없음
            const replyIsLiked = false;

            return {
              id: reply.id,
              content: reply.content,
              authorNickname: replyNickname,
              authorId: reply.authorId,
              likeCount: reply.likeCount,
              isLiked: !!replyIsLiked,
              createdAt: reply.createdAt,
            };
          }),
        );

        return {
          id: comment.id,
          content: comment.content,
          authorNickname: authorNickname,
          authorId: comment.authorId,
          likeCount: comment.likeCount,
          isLiked: !!isLiked,
          replies: repliesWithNicknames,
          createdAt: comment.createdAt,
        };
      }),
    );

    return {
      comments: commentsWithReplies,
      total,
    };
  }

  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userIdNum, post.buildingId);

    const comment = this.commentRepository.create({
      postId: postIdNum,
      authorId: userIdNum,
      parentCommentId: dto.parentCommentId ? parseInt(dto.parentCommentId.toString(), 10) : null,
      content: dto.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 댓글 수 증가
    post.commentCount += 1;
    await this.postRepository.save(post);

    // 활동 점수 이벤트 발행
    this.eventEmitter.emit('comment.created', new CommentCreatedEvent(userIdNum));

    // 작성자 닉네임 가져오기
    const author = await this.userRepository.findOne({
      where: { id: userIdNum },
    });
    const authorNickname = author?.nickname || '익명';

    return {
      id: savedComment.id,
      content: savedComment.content,
      authorNickname: authorNickname,
      authorId: savedComment.authorId,
      createdAt: savedComment.createdAt,
    };
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const commentIdNum = parseInt(commentId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const comment = await this.commentRepository.findOne({
      where: { id: commentIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userIdNum) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    comment.content = content;
    const updatedComment = await this.commentRepository.save(comment);

    return {
      id: updatedComment.id,
      updatedAt: updatedComment.updatedAt,
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const commentIdNum = parseInt(commentId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const comment = await this.commentRepository.findOne({
      where: { id: commentIdNum, deletedAt: IsNull() },
      withDeleted: false,
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userIdNum) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.commentRepository.softDelete(commentIdNum);

    // 댓글 수 감소
    const post = await this.postRepository.findOne({
      where: { id: comment.postId, deletedAt: IsNull() },
      withDeleted: false,
    });
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await this.postRepository.save(post);
    }

    return { message: '댓글이 삭제되었습니다.' };
  }

  async toggleCommentLike(commentId: string, userId: string) {
    // 댓글 좋아요 기능은 구현되지 않음
    throw new NotFoundException('댓글 좋아요 기능은 지원하지 않습니다.');
  }

  async getMyPosts(userId: string, page: number = 1, limit: number = 20) {
    const userIdNum = parseInt(userId, 10);

    const [posts, total] = await this.postRepository.findAndCount({
      where: { authorId: userIdNum, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'images'],
      withDeleted: false,
    });

    const postsWithNicknames = await Promise.all(
      posts.map(async (post) => {
        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });

        // 이미지 URL 배열 추출 (orderIndex 순서대로)
        const imageUrls = post.images
          ? post.images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((img) => img.imageUrl)
          : [];

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls,
          author: {
            id: post.authorId,
            nickname: author?.nickname || '익명',
          },
          boardType: post.boardType,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          viewCount: post.viewCount,
          isHot: post.isHot,
          createdAt: post.createdAt,
        };
      }),
    );

    return {
      posts: postsWithNicknames,
      total,
      page,
      limit,
    };
  }

  async getMyComments(userId: string, page: number = 1, limit: number = 20) {
    const userIdNum = parseInt(userId, 10);

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { authorId: userIdNum, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['post'],
      withDeleted: false,
    });

    const commentsWithPostInfo = await Promise.all(
      comments.map(async (comment) => {
        const post = await this.postRepository.findOne({
          where: { id: comment.postId, deletedAt: IsNull() },
          withDeleted: false,
        });

        const author = await this.userRepository.findOne({
          where: { id: comment.authorId },
        });

        return {
          id: comment.id,
          content: comment.content,
          postId: comment.postId,
          postTitle: post?.title || '삭제된 게시글',
          boardType: post?.boardType || 'chat',
          author: {
            id: comment.authorId,
            nickname: author?.nickname || '익명',
          },
          createdAt: comment.createdAt,
        };
      }),
    );

    return {
      comments: commentsWithPostInfo,
      total,
      page,
      limit,
    };
  }

  async getMyLikedPosts(userId: string, page: number = 1, limit: number = 20) {
    const userIdNum = parseInt(userId, 10);

    const [likes, total] = await this.postLikeRepository.findAndCount({
      where: { userId: userIdNum },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['post'],
    });

    const postsWithNicknames = await Promise.all(
      likes.map(async (like) => {
        const post = await this.postRepository.findOne({
          where: { id: like.postId, deletedAt: IsNull() },
          relations: ['author', 'images'],
          withDeleted: false,
        });

        if (!post) {
          return null;
        }

        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });

        // 이미지 URL 배열 추출 (orderIndex 순서대로)
        const imageUrls = post.images
          ? post.images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((img) => img.imageUrl)
          : [];

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls,
          author: {
            id: post.authorId,
            nickname: author?.nickname || '익명',
          },
          boardType: post.boardType,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          viewCount: post.viewCount,
          isHot: post.isHot,
          createdAt: post.createdAt,
        };
      }),
    );

    // null 값 제거 (삭제된 게시글)
    const validPosts = postsWithNicknames.filter((post) => post !== null);

    return {
      posts: validPosts,
      total,
      page,
      limit,
    };
  }

  private async verifyMembership(userId: number, buildingId: number) {
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        buildingId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('해당 건물의 멤버가 아닙니다.');
    }
  }
}

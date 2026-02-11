import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Post, BoardType } from './domain/entities/post.entity';
import { PostLike } from './domain/entities/post-like.entity';
import { Comment } from './domain/entities/comment.entity';
import { BuildingMembership, MembershipStatus } from '../building/domain/entities/building-membership.entity';
import { User } from '../auth/domain/entities/user.entity';
import { HotPostService } from './services/hot-post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommunityService {
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
    private hotPostService: HotPostService,
  ) {}

  async getPosts(
    buildingId: string,
    userId: string,
    boardType?: BoardType,
    page: number = 1,
    limit: number = 20,
  ) {
    const buildingIdNum = parseInt(buildingId, 10);
    const userIdNum = parseInt(userId, 10);
    
    // 멤버십 확인
    await this.verifyMembership(userIdNum, buildingIdNum);

    const where: FindOptionsWhere<Post> = {
      buildingId: buildingIdNum,
    };

    if (boardType) {
      where.boardType = boardType;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
    });

    // 작성자 닉네임 조회
    const postsWithNicknames = await Promise.all(
      posts.map(async (post) => {
        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });

        const isLiked = await this.postLikeRepository.findOne({
          where: {
            postId: post.id,
            userId: userIdNum,
          },
        });

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls: post.imageUrls || [],
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

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrls: post.imageUrls || [],
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
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum },
      relations: ['author', 'building'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.verifyMembership(userIdNum, post.buildingId);

    // 조회수 증가
    post.viewCount += 1;
    await this.postRepository.save(post);

    const author = await this.userRepository.findOne({
      where: { id: post.authorId },
    });

    const isLiked = await this.postLikeRepository.findOne({
      where: {
        postId: post.id,
        userId: userIdNum,
      },
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrls: post.imageUrls || [],
      author: {
        id: post.authorId,
        nickname: author?.nickname || '익명',
      },
      boardType: post.boardType,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount,
      isLiked: !!isLiked,
      isHot: post.isHot,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const userIdNum = parseInt(userId, 10);
    
    await this.verifyMembership(userIdNum, dto.buildingId);

    const post = this.postRepository.create({
      authorId: userIdNum,
      buildingId: dto.buildingId,
      boardType: dto.boardType,
      title: dto.title,
      content: dto.content,
      imageUrls: dto.imageUrls || [],
    });

    const savedPost = await this.postRepository.save(post);

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
      where: { id: postIdNum },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.authorId !== userIdNum) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    if (dto.title) post.title = dto.title;
    if (dto.content) post.content = dto.content;
    if (dto.imageUrls) post.imageUrls = dto.imageUrls;

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
      where: { id: postIdNum },
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
      where: { id: postIdNum },
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
      return { isLiked: true, likeCount: post.likeCount };
    }
  }

  async getComments(postId: string, userId: string, page: number = 1, limit: number = 50) {
    const postIdNum = parseInt(postId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const post = await this.postRepository.findOne({
      where: { id: postIdNum },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId: postIdNum, parentCommentId: null },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
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
          where: { parentCommentId: comment.id },
          order: { createdAt: 'ASC' },
          relations: ['author'],
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
      where: { id: postIdNum },
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
      where: { id: commentIdNum },
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
      where: { id: commentIdNum },
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
      where: { id: comment.postId },
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

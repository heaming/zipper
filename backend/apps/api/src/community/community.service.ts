import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '@infrastructure/community/persistence/post.entity';
import { CommentEntity } from '@infrastructure/community/persistence/comment.entity';
import { LikeEntity } from '@infrastructure/community/persistence/like.entity';
import { UserEntity } from '@infrastructure/auth/persistence/user.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // 건물별 게시글 조회 (위치 기반 필터링)
  async getPosts(userId: number, boardType?: string, limit: number = 20) {
    // 사용자 정보 조회 (건물 ID 확인)
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.buildingId) {
      throw new Error('사용자의 건물 정보를 찾을 수 없습니다.');
    }

    const query = this.postRepository
      .createQueryBuilder('post')
      .where('post.buildingId = :buildingId', { buildingId: user.buildingId })
      .orderBy('post.createdAt', 'DESC')
      .take(limit);

    if (boardType && boardType !== 'all') {
      query.andWhere('post.boardType = :boardType', { boardType });
    }

    const posts = await query.getMany();

    // 작성자 정보 추가
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await this.userRepository.findOne({
          where: { id: post.authorId },
        });
        return {
          ...post,
          author: author
            ? { id: author.id, email: author.email.split('@')[0] }
            : null,
        };
      }),
    );

    return postsWithAuthors;
  }

  // 게시글 상세 조회 (건물 접근 권한 확인)
  async getPost(id: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.buildingId) {
      throw new Error('사용자의 건물 정보를 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 같은 건물인지 확인
    if (post.buildingId !== user.buildingId) {
      throw new Error('해당 게시글에 접근할 수 없습니다.');
    }

    const author = await this.userRepository.findOne({
      where: { id: post.authorId },
    });

    return {
      ...post,
      author: author
        ? { id: author.id, email: author.email.split('@')[0] }
        : null,
    };
  }

  async getComments(postId: number) {
    const comments = await this.commentRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });

    // 작성자 정보 추가
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await this.userRepository.findOne({
          where: { id: comment.authorId },
        });
        return {
          ...comment,
          author: author
            ? { id: author.id, email: author.email.split('@')[0] }
            : null,
        };
      }),
    );

    return commentsWithAuthors;
  }

  async getLikes(targetId: number, targetType: string) {
    const likes = await this.likeRepository.find({
      where: { targetId, targetType },
    });
    return { count: likes.length, likes };
  }
}

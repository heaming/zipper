import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Post } from '../domain/entities/post.entity';

/**
 * HOT 게시물 점수 계산 로직
 * 
 * 최근 24시간 기준으로 계산
 * 점수 = (댓글 수 * 2) + (공감 수 * 1) + (조회 수 * 0.1)
 * 시간 가중치: 최근일수록 높은 점수 (24시간 내)
 */
@Injectable()
export class HotPostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  /**
   * HOT 게시물 점수 계산
   */
  calculateHotScore(post: Post): number {
    const now = new Date();
    const postTime = post.createdAt;
    const hoursDiff = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);

    // 24시간 이내 게시물만 계산
    if (hoursDiff > 24) {
      return 0;
    }

    // 시간 가중치 (최근일수록 높음, 0~1 사이)
    const timeWeight = 1 - hoursDiff / 24;

    // 기본 점수
    const commentScore = post.commentCount * 2;
    const likeScore = post.likeCount * 1;
    const viewScore = post.viewCount * 0.1;

    // 시간 가중치 적용
    const totalScore = (commentScore + likeScore + viewScore) * timeWeight;

    return Math.round(totalScore * 100) / 100; // 소수점 2자리
  }

  /**
   * 건물의 모든 게시물에 대해 HOT 점수 계산 및 업데이트
   */
  async updateHotScores(buildingId: number): Promise<void> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const posts = await this.postRepository.find({
      where: {
        buildingId,
      },
      relations: ['comments', 'likes'],
    });

    // 24시간 이내 게시물만 필터링
    const recentPosts = posts.filter(
      (post) => post.createdAt >= twentyFourHoursAgo,
    );

    for (const post of recentPosts) {
      const hotScore = this.calculateHotScore(post);
      post.hotScore = hotScore;
      post.isHot = hotScore > 10; // 임계값: 10점 이상
      post.hotCalculatedAt = new Date();
    }

    await this.postRepository.save(recentPosts);
  }

  /**
   * HOT 게시물 목록 조회 (상위 N개)
   */
  async getHotPosts(buildingId: number, limit: number = 10): Promise<Post[]> {
    await this.updateHotScores(buildingId);

    return this.postRepository.find({
      where: {
        buildingId,
        isHot: true,
      },
      order: {
        hotScore: 'DESC',
        createdAt: 'DESC',
      },
      take: limit,
      relations: ['author', 'building'],
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { UserActivity } from '../domain/entities/user-activity.entity';
import { Report } from '../../community/domain/entities/report.entity';
import { Post } from '../../community/domain/entities/post.entity';
import { Comment } from '../../community/domain/entities/comment.entity';
import { PostLike } from '../../community/domain/entities/post-like.entity';
import { BuildingVerificationStatus } from '../domain/entities/building-verification.entity';

export enum UserLevel {
  NEW_RESIDENT = 1, // 새 입주민
  SHY_RESIDENT = 2, // 수줍은 주민
  ACTIVE_RESIDENT = 3, // 활발한 주민
  SOCIABLE_RESIDENT = 4, // 발넓은 주민
  CORE_RESIDENT = 5, // 핵심 주민
  ZIPPER_KEEPER = 6, // ZIPPER 지기 (관리자가 직접 부여)
}

export interface LevelInfo {
  level: UserLevel;
  icon: string;
  name: string;
  color: string; // 레벨 테마색 (초록색 계열, 레벨별로 진해짐)
}

@Injectable()
export class LevelService {
  private readonly LEVEL_INFO: Record<UserLevel, LevelInfo> = {
    [UserLevel.NEW_RESIDENT]: {
      level: UserLevel.NEW_RESIDENT,
      icon: 'package',
      name: '새 입주민',
      color: '#4ccf89', // 기본 primary 색상
    },
    [UserLevel.SHY_RESIDENT]: {
      level: UserLevel.SHY_RESIDENT,
      icon: 'leaf',
      name: '수줍은 주민',
      color: '#3db870', // 조금 더 진한 초록
    },
    [UserLevel.ACTIVE_RESIDENT]: {
      level: UserLevel.ACTIVE_RESIDENT,
      icon: 'flower',
      name: '활발한 주민',
      color: '#2d9a5a', // 더 진한 초록
    },
    [UserLevel.SOCIABLE_RESIDENT]: {
      level: UserLevel.SOCIABLE_RESIDENT,
      icon: 'tree-deciduous',
      name: '발넓은 주민',
      color: '#1e7a45', // 매우 진한 초록
    },
    [UserLevel.CORE_RESIDENT]: {
      level: UserLevel.CORE_RESIDENT,
      icon: 'trees',
      name: '핵심 주민',
      color: '#0f5a2f', // 가장 진한 초록
    },
    [UserLevel.ZIPPER_KEEPER]: {
      level: UserLevel.ZIPPER_KEEPER,
      icon: 'key',
      name: 'ZIPPER 지기',
      color: '#5a500f', // 갈색
    },
  };

  private readonly DAILY_SCORE_LIMIT = 100; // 하루 최대 획득 점수

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
  ) {}

  /**
   * 레벨 정보 조회
   */
  getLevelInfo(level: UserLevel): LevelInfo {
    return this.LEVEL_INFO[level];
  }

  /**
   * 사용자의 현재 레벨 정보 조회
   */
  async getUserLevelInfo(userId: number): Promise<LevelInfo> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return this.LEVEL_INFO[UserLevel.NEW_RESIDENT];
    }
    // LV6 (ZIPPER 지기)는 별도 role 시스템으로 관리자가 직접 부여
    // user.level이 6이면 ZIPPER_KEEPER 반환
    const userLevel = user.level as UserLevel;
    if (userLevel === 6) {
      return this.LEVEL_INFO[UserLevel.ZIPPER_KEEPER];
    }
    return this.LEVEL_INFO[userLevel] || this.LEVEL_INFO[UserLevel.NEW_RESIDENT];
  }

  /**
   * 레벨별 다음 레벨까지 필요한 점수 기준
   */
  private getLevelThresholds(level: number): { current: number; next: number } {
    switch (level) {
      case 1:
        return { current: 0, next: 20 }; // LV1 -> LV2: 게시글 1개(10) + 댓글 3개(9) = 19점
      case 2:
        return { current: 20, next: 130 }; // LV2 -> LV3: 게시글 5개(50) + 댓글 20개(60) + 좋아요 10개(20) = 130점
      case 3:
        return { current: 130, next: 400 }; // LV3 -> LV4: 게시글 15개(150) + 댓글 50개(150) + 좋아요 50개(100) = 400점
      case 4:
        return { current: 400, next: 400 }; // LV4 -> LV5: 활동 점수 400 이상
      case 5:
        return { current: 400, next: 400 }; // LV5는 최대 레벨
      case 6:
        return { current: 400, next: 400 }; // LV6 (ZIPPER 지기)는 관리자가 직접 부여하는 최고 레벨
      default:
        return { current: 0, next: 400 };
    }
  }

  /**
   * 사용자의 레벨 진행률 정보 조회
   */
  async getUserLevelProgress(userId: number): Promise<{
    progress: number; // 0-100
    remainingPoints: number; // 다음 레벨까지 남은 점수
    scoreInLevel: number; // 현재 레벨에서 획득한 점수
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { progress: 0, remainingPoints: 20, scoreInLevel: 0 };
    }

    // LV6 (ZIPPER 지기)는 최고 레벨이므로 100% 진행률
    if (user.level === 6 || user.level === UserLevel.ZIPPER_KEEPER) {
      return {
        progress: 100,
        remainingPoints: 0,
        scoreInLevel: 0,
      };
    }

    const thresholds = this.getLevelThresholds(user.level);
    const currentScore = user.activityScore || 0;
    const scoreInLevel = Math.max(currentScore - thresholds.current, 0);
    const scoreNeeded = thresholds.next - thresholds.current;
    const progress =
      user.level === UserLevel.CORE_RESIDENT
        ? 100
        : Math.min((scoreInLevel / scoreNeeded) * 100, 100);
    const remainingPoints =
      user.level === UserLevel.CORE_RESIDENT ? 0 : Math.max(scoreNeeded - scoreInLevel, 0);

    return {
      progress: Math.round(progress),
      remainingPoints,
      scoreInLevel,
    };
  }

  /**
   * 활동 점수 추가 (일일 제한 확인)
   */
  async addActivityScore(
    userId: number,
    score: number,
    activityType: 'post' | 'comment' | 'like_received' | 'report_received',
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 활동 기록 조회 또는 생성
    let activity = await this.userActivityRepository.findOne({
      where: {
        userId,
        activityDate: today,
      },
    });

    if (!activity) {
      activity = this.userActivityRepository.create({
        userId,
        activityDate: today,
        dailyScore: 0,
      });
    }

    // 일일 제한 확인
    const remainingLimit = this.DAILY_SCORE_LIMIT - activity.dailyScore;
    const actualScore = Math.min(score, remainingLimit);

    if (actualScore <= 0) {
      return; // 일일 제한 초과
    }

    // 활동 점수 업데이트
    activity.dailyScore += actualScore;
    await this.userActivityRepository.save(activity);

    // 사용자 총 활동 점수 업데이트
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.activityScore += actualScore;
      user.lastActivityDate = new Date();
      await this.userRepository.save(user);

      // 레벨 재계산
      await this.recalculateLevel(userId);
    }
  }

  /**
   * 레벨 재계산
   */
  async recalculateLevel(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    // 건물 인증 완료 여부 확인
    if (user.buildingVerificationStatus !== BuildingVerificationStatus.VERIFIED) {
      // LV1로 설정
      if (user.level !== UserLevel.NEW_RESIDENT) {
        user.level = UserLevel.NEW_RESIDENT;
        user.levelUpdatedAt = new Date();
        await this.userRepository.save(user);
      }
      return;
    }

    // 통계 조회
    const stats = await this.getUserStats(userId);

    // 레벨 조건 확인 (낮은 레벨부터 확인)
    let newLevel = UserLevel.NEW_RESIDENT;

    // LV5: 핵심 주민
    if (
      stats.activityScore >= 400 &&
      stats.receivedLikes >= 150 &&
      stats.recentReports <= 0 &&
      stats.daysSinceFirstActivity >= 30
    ) {
      newLevel = UserLevel.CORE_RESIDENT;
    }
    // LV4: 발넓은 주민
    else if (
      stats.postCount >= 15 &&
      stats.commentCount >= 50 &&
      stats.receivedLikes >= 50 &&
      stats.totalReports <= 1
    ) {
      newLevel = UserLevel.SOCIABLE_RESIDENT;
    }
    // LV3: 활발한 주민
    else if (stats.postCount >= 5 && stats.commentCount >= 20 && stats.receivedLikes >= 10) {
      newLevel = UserLevel.ACTIVE_RESIDENT;
    }
    // LV2: 수줍은 주민
    else if (stats.postCount >= 1 && stats.commentCount >= 3) {
      newLevel = UserLevel.SHY_RESIDENT;
    }
    // LV1: 새 입주민 (기본)

    // 레벨 변경 시 업데이트
    if (user.level !== newLevel) {
      user.level = newLevel;
      user.levelUpdatedAt = new Date();
      await this.userRepository.save(user);
    }
  }

  /**
   * 사용자 통계 조회
   */
  private async getUserStats(userId: number): Promise<{
    postCount: number;
    commentCount: number;
    receivedLikes: number;
    totalReports: number;
    recentReports: number;
    activityScore: number;
    daysSinceFirstActivity: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        postCount: 0,
        commentCount: 0,
        receivedLikes: 0,
        totalReports: 0,
        recentReports: 0,
        activityScore: 0,
        daysSinceFirstActivity: 0,
      };
    }

    // 게시글 수
    const postCount = await this.postRepository.count({
      where: { authorId: userId },
    });

    // 댓글 수
    const commentCount = await this.commentRepository.count({
      where: { authorId: userId },
    });

    // 받은 좋아요 수 (게시글 기준)
    const userPosts = await this.postRepository.find({
      where: { authorId: userId },
      select: ['id', 'likeCount'],
    });
    // 각 게시글의 likeCount 합산
    const receivedLikes = userPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0);

    // 신고 수 (전체)
    const totalReports = await this.reportRepository.count({
      where: { reportedUserId: userId },
    });

    // 최근 30일 신고 수
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReports = await this.reportRepository.count({
      where: {
        reportedUserId: userId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // 활동 점수
    const activityScore = user.activityScore || 0;

    // 첫 활동일로부터 경과 일수 (회원가입일 기준)
    const daysSinceFirstActivity = user.createdAt
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      postCount,
      commentCount,
      receivedLikes,
      totalReports,
      recentReports,
      activityScore,
      daysSinceFirstActivity,
    };
  }

  /**
   * 모든 사용자 레벨 재계산 (스케줄러용)
   */
  async recalculateAllLevels(): Promise<void> {
    const users = await this.userRepository.find({
      where: { deletedAt: null },
    });

    for (const user of users) {
      await this.recalculateLevel(user.id);
    }
  }
}

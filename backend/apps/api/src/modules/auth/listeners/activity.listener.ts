import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LevelService } from '../services/level.service';
import {
  PostCreatedEvent,
  CommentCreatedEvent,
  PostLikedEvent,
  UserReportedEvent,
} from '../events/activity.events';

@Injectable()
export class ActivityListener {
  constructor(private readonly levelService: LevelService) {}

  @OnEvent('post.created')
  async handlePostCreated(event: PostCreatedEvent) {
    await this.levelService.addActivityScore(event.userId, 10, 'post');
  }

  @OnEvent('comment.created')
  async handleCommentCreated(event: CommentCreatedEvent) {
    await this.levelService.addActivityScore(event.userId, 3, 'comment');
  }

  @OnEvent('post.liked')
  async handlePostLiked(event: PostLikedEvent) {
    await this.levelService.addActivityScore(event.postAuthorId, 2, 'like_received');
  }

  @OnEvent('user.reported')
  async handleUserReported(event: UserReportedEvent) {
    await this.levelService.addActivityScore(event.reportedUserId, -30, 'report_received');
    // 신고 시 레벨 재계산 (강등 가능)
    await this.levelService.recalculateLevel(event.reportedUserId);
  }
}

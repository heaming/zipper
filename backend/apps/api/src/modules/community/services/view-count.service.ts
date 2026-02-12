import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ViewCountService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // 게시글 조회수 중복 방지 (24시간 내 동일 사용자의 중복 조회 방지)
  async canIncrementView(postId: number, userId: number): Promise<boolean> {
    const key = `post_view:${postId}:${userId}`;
    const viewed = await this.cacheManager.get<boolean>(key);

    if (viewed) {
      return false; // 이미 조회함
    }

    // 24시간 TTL
    await this.cacheManager.set(key, true, 24 * 60 * 60 * 1000);
    return true;
  }

  // 조회수 캐시 삭제 (테스트용)
  async clearViewCache(postId: number, userId: number): Promise<void> {
    const key = `post_view:${postId}:${userId}`;
    await this.cacheManager.del(key);
  }
}

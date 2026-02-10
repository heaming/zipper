// Repository Port 인터페이스 (Nest 의존성 ❌)
import { Post, BoardType } from '../models/post';

export interface PostRepository {
  findById(id: number): Promise<Post | null>;
  findByBuilding(
    buildingId: number,
    boardType?: BoardType,
    page?: number,
    limit?: number,
  ): Promise<{ posts: Post[]; total: number }>;
  findHotPosts(buildingId: number, limit?: number): Promise<Post[]>;
  save(post: Post): Promise<Post>;
  delete(id: number): Promise<void>;
}

export const POST_REPOSITORY = Symbol('POST_REPOSITORY');

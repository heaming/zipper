// UseCase (Nest 의존성 ❌)
import { PostRepository } from '@domain/community/ports/post.repository';
import { Post } from '@domain/community/models/post';

export class GetHotPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(buildingId: number, limit: number = 10): Promise<Post[]> {
    // HOT 점수 계산 로직은 Service나 별도 계산 모듈에서 수행
    return this.postRepository.findHotPosts(buildingId, limit);
  }
}

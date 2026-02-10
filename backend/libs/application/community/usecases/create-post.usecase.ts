// UseCase (Nest 의존성 ❌)
import { PostRepository } from '@domain/community/ports/post.repository';
import { Post } from '@domain/community/models/post';
import { CreatePostCommand } from '../commands/create-post.command';

export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(command: CreatePostCommand) {
    // 도메인 모델 생성
    const post = new Post(
      0, // ID는 Repository에서 생성
      command.userId,
      command.buildingId,
      command.boardType,
      command.title,
      command.content,
      command.imageUrls,
    );

    // 저장
    const savedPost = await this.postRepository.save(post);

    return {
      id: savedPost.id,
      title: savedPost.title,
      createdAt: savedPost.createdAt,
    };
  }
}

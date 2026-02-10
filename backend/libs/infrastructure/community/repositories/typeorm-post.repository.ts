// Repository Adapter (Nest 사용 가능 ✅)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRepository } from '@domain/community/ports/post.repository';
import { Post, BoardType } from '@domain/community/models/post';
import { PostEntity } from '../persistence/post.entity';

@Injectable()
export class TypeOrmPostRepository implements PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repository: Repository<PostEntity>,
  ) {}

  async findById(id: number): Promise<Post | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByBuilding(
    buildingId: number,
    boardType?: BoardType,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: Post[]; total: number }> {
    const qb = this.repository.createQueryBuilder('post');
    qb.where('post.buildingId = :buildingId', { buildingId });

    if (boardType) {
      qb.andWhere('post.boardType = :boardType', { boardType });
    }

    qb.orderBy('post.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      posts: entities.map((e) => this.toDomain(e)),
      total,
    };
  }

  async findHotPosts(buildingId: number, limit: number = 10): Promise<Post[]> {
    const entities = await this.repository.find({
      where: { buildingId, isHot: true },
      order: { hotScore: 'DESC', createdAt: 'DESC' },
      take: limit,
    });

    return entities.map((e) => this.toDomain(e));
  }

  async save(post: Post): Promise<Post> {
    const entity = this.toEntity(post);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  private toDomain(entity: PostEntity): Post {
    return new Post(
      entity.id,
      entity.authorId,
      entity.buildingId,
      entity.boardType as BoardType,
      entity.title,
      entity.content,
      entity.imageUrls || [],
      entity.likeCount,
      entity.commentCount,
      entity.viewCount,
      Number(entity.hotScore),
      entity.isHot,
      entity.hotCalculatedAt,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }

  private toEntity(domain: Post): PostEntity {
    const entity = new PostEntity();
    if (domain.id) entity.id = domain.id;
    entity.authorId = domain.authorId;
    entity.buildingId = domain.buildingId;
    entity.boardType = domain.boardType;
    entity.title = domain.title;
    entity.content = domain.content;
    entity.imageUrls = domain.imageUrls;
    entity.likeCount = domain.likeCount;
    entity.commentCount = domain.commentCount;
    entity.viewCount = domain.viewCount;
    entity.hotScore = domain.hotScore;
    entity.isHot = domain.isHot;
    entity.hotCalculatedAt = domain.hotCalculatedAt;
    return entity;
  }
}

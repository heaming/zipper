import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Post, BoardType, PostStatus } from '../../domain/entities/post.entity';
import { PostImage } from '../../domain/entities/post-image.entity';
import { PostMeta } from '../../domain/entities/post-meta.entity';

/**
 * Post Repository
 * buildingId 필터를 강제하는 멀티테넌시 구조
 */
@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(PostMeta)
    private readonly postMetaRepository: Repository<PostMeta>,
  ) {}

  /**
   * buildingId를 강제하는 조회 메서드
   * 모든 조회는 반드시 buildingId를 포함해야 함
   */
  async findByBuilding(
    buildingId: number,
    options: {
      boardType?: BoardType;
      status?: PostStatus;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { boardType, status, page = 1, limit = 20 } = options;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.buildingId = :buildingId', { buildingId })
      .andWhere('post.deletedAt IS NULL');

    if (boardType) {
      queryBuilder.andWhere('post.boardType = :boardType', { boardType });
    }

    if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.meta', 'meta')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total };
  }

  /**
   * buildingId를 강제하는 단일 조회
   */
  async findOneByBuilding(
    postId: number,
    buildingId: number,
  ): Promise<Post | null> {
    return this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :postId', { postId })
      .andWhere('post.buildingId = :buildingId', { buildingId })
      .andWhere('post.deletedAt IS NULL')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.meta', 'meta')
      .getOne();
  }

  /**
   * Post 생성 및 저장
   */
  async create(postData: {
    authorId: number;
    buildingId: number;
    boardType: BoardType;
    title: string;
    content: string;
    status?: PostStatus;
    isCommercial?: boolean;
  }): Promise<Post> {
    const post = this.postRepository.create({
      ...postData,
      status: postData.status || PostStatus.ACTIVE,
      isCommercial: postData.isCommercial || false,
    });

    return this.postRepository.save(post);
  }

  /**
   * PostImage 저장
   */
  async saveImages(postId: number, imageUrls: string[]): Promise<PostImage[]> {
    // 기존 이미지 삭제
    await this.postImageRepository.delete({ postId });

    // 새 이미지 저장
    const images = imageUrls.map((url, index) =>
      this.postImageRepository.create({
        postId,
        imageUrl: url,
        orderIndex: index,
      }),
    );

    return this.postImageRepository.save(images);
  }

  /**
   * PostMeta 저장
   */
  async saveMeta(
    postId: number,
    metaData: {
      price?: number;
      quantity?: number;
      deadline?: Date;
      locationDetail?: string;
      extraData?: Record<string, any>;
    },
  ): Promise<PostMeta> {
    // 기존 meta 삭제
    await this.postMetaRepository.delete({ postId });

    // 새 meta 저장
    const meta = this.postMetaRepository.create({
      postId,
      ...metaData,
    });

    return this.postMetaRepository.save(meta);
  }

  /**
   * Post 업데이트
   */
  async update(postId: number, buildingId: number, data: Partial<Post>): Promise<Post> {
    await this.postRepository.update(
      { id: postId, buildingId },
      data,
    );

    const updated = await this.findOneByBuilding(postId, buildingId);
    if (!updated) {
      throw new Error('Post not found');
    }

    return updated;
  }

  /**
   * Post 소프트 삭제
   */
  async softDelete(postId: number, buildingId: number): Promise<void> {
    await this.postRepository.softDelete({ id: postId, buildingId });
  }
}

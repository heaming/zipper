// 순수 도메인 모델 (Nest 의존성 ❌)
export enum BoardType {
  FREE = 'FREE',
  DELIVERY = 'DELIVERY',
  LIFESTYLE = 'LIFESTYLE',
}

export class Post {
  constructor(
    public readonly id: number,
    public readonly authorId: number,
    public readonly buildingId: number,
    public readonly boardType: BoardType,
    public title: string,
    public content: string,
    public imageUrls: string[] = [],
    public likeCount: number = 0,
    public commentCount: number = 0,
    public viewCount: number = 0,
    public hotScore: number = 0,
    public isHot: boolean = false,
    public hotCalculatedAt?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date,
  ) {}

  incrementView(): void {
    this.viewCount++;
  }

  incrementLike(): void {
    this.likeCount++;
  }

  decrementLike(): void {
    if (this.likeCount > 0) {
      this.likeCount--;
    }
  }

  incrementComment(): void {
    this.commentCount++;
  }

  decrementComment(): void {
    if (this.commentCount > 0) {
      this.commentCount--;
    }
  }

  updateHotScore(score: number): void {
    this.hotScore = score;
    this.isHot = score > 10;
    this.hotCalculatedAt = new Date();
  }

  isWithin24Hours(): boolean {
    if (!this.createdAt) return false;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - this.createdAt.getTime() < twentyFourHours;
  }
}

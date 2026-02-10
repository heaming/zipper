// Command DTO (순수 TypeScript)
import { BoardType } from '@domain/community/models/post';

export class CreatePostCommand {
  constructor(
    public readonly userId: number,
    public readonly buildingId: number,
    public readonly boardType: BoardType,
    public readonly title: string,
    public readonly content: string,
    public readonly imageUrls: string[] = [],
  ) {}
}

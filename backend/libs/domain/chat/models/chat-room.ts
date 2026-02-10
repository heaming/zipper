// 순수 도메인 모델 (Nest 의존성 ❌)
export enum RoomType {
  BUILDING = 'BUILDING',
  TOPIC = 'TOPIC',
}

export class ChatRoom {
  constructor(
    public readonly id: string,
    public readonly buildingId: number,
    public readonly roomType: RoomType,
    public readonly createdBy: number,
    public topicName?: string,
    public postId?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isBuildingRoom(): boolean {
    return this.roomType === RoomType.BUILDING;
  }

  isTopicRoom(): boolean {
    return this.roomType === RoomType.TOPIC;
  }
}

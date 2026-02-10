// Repository Port 인터페이스 (Nest 의존성 ❌)
import { ChatRoom } from '../models/chat-room';

export interface ChatRoomRepository {
  findById(id: string): Promise<ChatRoom | null>;
  findByBuilding(buildingId: number): Promise<ChatRoom[]>;
  findBuildingRoom(buildingId: number): Promise<ChatRoom | null>;
  save(room: ChatRoom): Promise<ChatRoom>;
}

export const CHAT_ROOM_REPOSITORY = Symbol('CHAT_ROOM_REPOSITORY');

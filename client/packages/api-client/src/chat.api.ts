import type { ApiClient } from './client'
import type {
  ChatRoom,
  ChatMessage,
  CreateChatRoomRequest,
  SendMessageRequest,
  GetMessagesParams,
  GetMessagesResponse,
  GetRoomsResponse,
} from './types/chat.types'

export class ChatApi {
  constructor(private client: ApiClient) {}

  // 채팅방 목록 (건물 기준)
  async getRooms(buildingId: number): Promise<GetRoomsResponse> {
    return this.client.get(`/api/chat/rooms?buildingId=${buildingId}`)
  }

  // 채팅방 생성
  async createRoom(data: CreateChatRoomRequest): Promise<ChatRoom> {
    return this.client.post('/api/chat/rooms', data)
  }

  // 채팅방 입장
  async joinRoom(roomId: number): Promise<void> {
    return this.client.post(`/api/chat/rooms/${roomId}/join`)
  }

  // 메시지 목록 조회 (커서 기반 — 모바일 무한스크롤)
  async getMessages(roomId: number, params: GetMessagesParams = {}): Promise<GetMessagesResponse> {
    const query = new URLSearchParams()
    if (params.before) query.set('before', params.before)
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.client.get(`/api/chat/rooms/${roomId}/messages${qs ? `?${qs}` : ''}`)
  }

  // 메시지 전송 (REST — WebSocket 불가 환경 fallback)
  async sendMessage(
    roomId: number,
    data: SendMessageRequest,
  ): Promise<Pick<ChatMessage, 'id' | 'content' | 'createdAt'>> {
    return this.client.post(`/api/chat/rooms/${roomId}/messages`, data)
  }
}

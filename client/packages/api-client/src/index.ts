/**
 * @zipper/api-client
 *
 * Light Hexagonal 구조:
 *   types/   — 도메인 타입 (Port 계약)
 *   *.api.ts — HTTP 어댑터 구현체
 *   client.ts — 베이스 HTTP 클라이언트
 *
 * 모바일 WebView 고려사항:
 *   - postFormData: 네이티브 파일 피커 → File 객체 직접 전송
 *   - 204 No Content 자동 처리
 *   - AbortController 기반 타임아웃 (느린 모바일 네트워크 대응)
 */

// ── 베이스 클라이언트 ──────────────────────────────────────────────
export { ApiClient } from './client'
export type { ApiClientConfig } from './client'

// ── 도메인 타입 ────────────────────────────────────────────────────
export type { PaginationParams, PaginatedResponse, ApiError } from './types/common.types'
export type {
  UserProfile,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  LevelInfo,
  VerifyResidenceGpsRequest,
  VerifyResidenceInviteCodeRequest,
  VerifyResidenceResponse,
} from './types/auth.types'
export type {
  BoardType,
  Post,
  Comment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
} from './types/community.types'
export type {
  RoomType,
  MessageType,
  ChatRoom,
  ChatMessage,
  CreateChatRoomRequest,
  SendMessageRequest,
  GetMessagesParams,
  GetMessagesResponse,
  GetRoomsResponse,
} from './types/chat.types'
export type {
  NotificationType,
  Notification,
  GetNotificationsParams,
  GetNotificationsResponse,
} from './types/notification.types'
export type { Building, BuildingSearchResult } from './types/building.types'

// ── API 어댑터 ─────────────────────────────────────────────────────
export { AuthApi } from './auth.api'
export { CommunityApi } from './community.api'
export { CommentApi } from './comment.api'
export { ChatApi } from './chat.api'
export { NotificationApi } from './notification.api'
export { BuildingApi } from './building.api'
export { ImageApi } from './image.api'

// ── Factory ────────────────────────────────────────────────────────
import { ApiClient } from './client'
import { AuthApi } from './auth.api'
import { CommunityApi } from './community.api'
import { CommentApi } from './comment.api'
import { ChatApi } from './chat.api'
import { NotificationApi } from './notification.api'
import { BuildingApi } from './building.api'
import { ImageApi } from './image.api'
import type { ApiClientConfig } from './client'

export function createApiClient(config: ApiClientConfig) {
  const client = new ApiClient(config)

  return {
    /** 베이스 HTTP 클라이언트 (직접 사용 필요 시) */
    client,
    /** 인증, 프로필, 레벨, 거주 인증 */
    auth: new AuthApi(client),
    /** 게시글 CRUD, 좋아요, HOT 게시글 */
    community: new CommunityApi(client),
    /** 댓글 CRUD, 좋아요 */
    comment: new CommentApi(client),
    /** 채팅방 목록, 메시지 조회/전송 (REST fallback) */
    chat: new ChatApi(client),
    /** 알림 조회, 읽음 처리 */
    notification: new NotificationApi(client),
    /** 건물 검색, 조회 */
    building: new BuildingApi(client),
    /** 이미지 업로드 (multipart/form-data) */
    image: new ImageApi(client),
  }
}

export type ApiClientInstance = ReturnType<typeof createApiClient>

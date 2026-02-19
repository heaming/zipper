/**
 * 공통 타입 정의 (Frontend View Models)
 */

// Community Models
export * from './community'

// User Models
export type BuildingVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface User {
  id: number
  email: string
  nickname?: string
  phoneNumber?: string
  buildingId?: number
  buildingName?: string
  dong?: string
  ho?: string
  buildingVerificationStatus?: BuildingVerificationStatus
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
}

// Building Models
export interface Building {
  id: number
  name: string
  address: string
  addressDetail?: string
  buildingType: 'APARTMENT' | 'OFFICETEL' | 'VILLA'
  inviteCode: string
  memberCount: number
}

// Post Models
export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  buildingId: number
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  imageUrls: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  isHot: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  authorNickname: string
  content: string
  likeCount: number
  parentId?: number
  createdAt: string
}

// Chat Models
export interface ChatRoom {
  id: number
  buildingId: number
  roomType: 'BUILDING' | 'TOPIC'
  topicName?: string
  postId?: number
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export interface ChatMessage {
  id: number
  roomId: number
  senderId: number
  senderNickname: string
  content: string
  messageType: 'TEXT' | 'IMAGE'
  imageUrl?: string
  createdAt: string
}

// Notification Models
export interface Notification {
  id: number
  userId: number
  type: 'COMMENT' | 'REPLY' | 'MENTION' | 'HOT_POST' | 'CHAT_MENTION'
  title: string
  content: string
  isRead: boolean
  relatedPostId?: number
  relatedCommentId?: number
  relatedChatRoomId?: number
  createdAt: string
}

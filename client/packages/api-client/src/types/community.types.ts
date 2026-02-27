/**
 * 커뮤니티 도메인 타입
 */

export type BoardType = 'FREE' | 'DELIVERY' | 'LIFESTYLE'

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  buildingId: number
  boardType: BoardType
  imageUrls: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  isHot: boolean
  isLiked?: boolean
  isAuthor?: boolean
  participants?: number[]
  participantCount?: number
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
  isLiked?: boolean
  isAuthor?: boolean
  parentId?: number
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  title: string
  content: string
  boardType: BoardType
  imageUrls?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  imageUrls?: string[]
}

export interface CreateCommentRequest {
  content: string
  parentId?: number
}

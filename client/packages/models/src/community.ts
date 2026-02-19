/**
 * 커뮤니티 태그 시스템
 */

import { List, ShoppingCart, Gift, Home, MessageCircle, Store } from 'lucide-react'

export enum CommunityTag {
  ALL = 'all',
  TOGATHER = 'togather',      // 같이 사요
  SHARE = 'share',             // 나눔
  LIFESTYLE = 'lifestyle',     // ZIP 생활
  CHAT = 'chat',               // 잡담
  MARKET = 'market',           // ZIP 마켓
}

export const TAG_LABELS: Record<CommunityTag, string> = {
  [CommunityTag.ALL]: '전체',
  [CommunityTag.TOGATHER]: '같이 사요',
  [CommunityTag.SHARE]: '나눔',
  [CommunityTag.LIFESTYLE]: 'ZIP 생활',
  [CommunityTag.CHAT]: '잡담',
  [CommunityTag.MARKET]: 'ZIP 마켓',
}

export const TAG_ICONS: Record<CommunityTag, any> = {
  [CommunityTag.ALL]: List,
  [CommunityTag.TOGATHER]: ShoppingCart,
  [CommunityTag.SHARE]: Gift,
  [CommunityTag.LIFESTYLE]: Home,
  [CommunityTag.CHAT]: MessageCircle,
  [CommunityTag.MARKET]: Store,
}

/**
 * 같이 사요 카테고리
 */
export enum TogatherCategory {
  GROUP_BUY = 'GROUP_BUY',  // 공구
  FOOD = 'FOOD',            // 음식
  DELIVERY = 'DELIVERY',    // 배달
}

export const TOGATHER_CATEGORY_LABELS: Record<TogatherCategory, string> = {
  [TogatherCategory.GROUP_BUY]: '공구',
  [TogatherCategory.FOOD]: '음식',
  [TogatherCategory.DELIVERY]: '배달',
}

/**
 * 게시글 타입
 */
export interface CommunityPost {
  id: number
  tag: CommunityTag
  title: string
  content: string
  authorNickname: string
  authorLocation: string // "○○동"
  createdAt: string
  commentCount: number
  likeCount: number
  
  // 같이 사요 전용
  togatherCategory?: TogatherCategory
  quantity?: number
  deadline?: string
  chatRoomId?: number
}

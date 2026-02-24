import { CommunityTag } from '@zipper/models/src/community'

export const writeOptions = [
  { tag: CommunityTag.LIFESTYLE, description: '우리 동네 궁금해요' },
  { tag: CommunityTag.TOGATHER, description: '공구·음식·배달 함께해요' },
  { tag: CommunityTag.CHAT, description: '자유롭게 이야기해요' },
  { tag: CommunityTag.SHARE, description: '무료로 나눠드려요' },
  { tag: CommunityTag.MARKET, description: '상업 광고 (권한 필요)' },
] as const

export const boardTypeByTag: Record<CommunityTag, 'togather' | 'share' | 'lifestyle' | 'chat' | 'market' | 'all'> = {
  [CommunityTag.TOGATHER]: 'togather',
  [CommunityTag.SHARE]: 'share',
  [CommunityTag.LIFESTYLE]: 'lifestyle',
  [CommunityTag.CHAT]: 'chat',
  [CommunityTag.MARKET]: 'market',
  [CommunityTag.ALL]: 'all',
}


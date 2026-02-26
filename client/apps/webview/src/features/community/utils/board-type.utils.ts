import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'

export const getBoardTypeLabel = (boardType: string) => {
  const labels: Record<string, string> = {
    togather: '같이 사요',
    share: '나눔',
    lifestyle: 'ZIP 생활',
    chat: '잡담',
    market: '중고장터'
  }
  return labels[boardType] || boardType
}

export const getTagClass = (boardType: string) => {
  return `tag-${boardType.toLowerCase()}`
}

export const getBoardTypeCommunityTag = (boardType: string): CommunityTag => {
  const mapping: Record<string, CommunityTag> = {
    'togather': CommunityTag.TOGATHER,
    'share': CommunityTag.SHARE,
    'lifestyle': CommunityTag.LIFESTYLE,
    'chat': CommunityTag.CHAT,
    'market': CommunityTag.MARKET,
    'all': CommunityTag.ALL
  }
  return mapping[boardType.toLowerCase()] || CommunityTag.ALL
}

export const tagColors: Record<CommunityTag, string> = {
  [CommunityTag.ALL]: '#4ccf89',
  [CommunityTag.TOGATHER]: '#fd6174',
  [CommunityTag.SHARE]: '#7ba8f0',
  [CommunityTag.LIFESTYLE]: '#ff8e60',
  [CommunityTag.CHAT]: '#4ccf89',
  [CommunityTag.MARKET]: '#a88af8',
}

export const getBoardTypeColor = (boardType: string): string => {
  const tag = getBoardTypeCommunityTag(boardType)
  return tagColors[tag] || '#4ccf89'
}

/**
 * 마감 시간 포맷팅 함수 (같이사요용)
 */
export const formatDeadline = (deadline?: string): string | null => {
  if (!deadline) return null
  try {
    const date = new Date(deadline)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = date.getHours() >= 12 ? '오후' : '오전'
    const displayHours = date.getHours() > 12 ? String(date.getHours() - 12) : String(date.getHours() || 12)
    
    if (diffDays === 0) {
      return `오늘 ${ampm} ${displayHours}:${minutes}`
    } else if (diffDays === 1) {
      return `내일 ${ampm} ${displayHours}:${minutes}`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()} ${ampm} ${displayHours}:${minutes}`
    }
  } catch {
    return null
  }
}

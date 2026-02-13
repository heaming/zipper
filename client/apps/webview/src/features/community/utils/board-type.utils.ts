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

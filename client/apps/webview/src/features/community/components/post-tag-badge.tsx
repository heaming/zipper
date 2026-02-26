'use client'

import { TAG_ICONS } from '@zipper/models/src/community'
import { getBoardTypeCommunityTag, getBoardTypeLabel, getTagClass, tagColors } from '../utils/board-type.utils'
import { cn } from '@/lib/utils'

interface PostTagBadgeProps {
  boardType: string
}

export function PostTagBadge({ boardType }: PostTagBadgeProps) {
  const tag = getBoardTypeCommunityTag(boardType)
  const Icon = TAG_ICONS[tag]
  const color = tagColors[tag]

  return (
    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-2 font-bold">
      {Icon && (
        <Icon 
          className={cn("w-2.5 h-2.5", getTagClass(boardType))} 
          strokeWidth={1.5} 
          style={{ color }} 
        />
      )}
      <span className="text-gray-400">
        {getBoardTypeLabel(boardType)}
      </span>
    </div>
  )
}

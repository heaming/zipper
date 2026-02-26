'use client'

import { CommunityTag, TAG_ICONS } from '@zipper/models/src/community'
import { getBoardTypeLabel, getTagClass, getBoardTypeCommunityTag } from '@/features/community/utils/board-type.utils'
import { cn } from '@/lib/utils'

interface Post {
  boardType?: string | null
}

interface Props {
  post: Post
}

export function SimplePostDetail({ post }: Props) {
  if (!post.boardType) return null

  const tag = getBoardTypeCommunityTag(post.boardType)
  const Icon = TAG_ICONS[tag]

  return (
    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-3">
      {Icon && <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} />}
      <span className="text-gray-400">
        {getBoardTypeLabel(post.boardType)}
      </span>
    </div>
  )
}

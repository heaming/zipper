'use client'

import { Card, CardContent, Badge, Divider } from '@ui/index'
import { formatRelativeTime, formatNumber } from '@/lib/utils'

interface PostCardProps {
  id: string
  title: string
  content: string
  authorNickname: string
  createdAt: string
  likeCount: number
  commentCount: number
  viewCount: number
  isHot?: boolean
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
}

const boardTypeLabels = {
  FREE: '자유',
  DELIVERY: '배달/나눔',
  LIFESTYLE: '생활',
}

export default function PostCard({
  title,
  content,
  authorNickname,
  createdAt,
  likeCount,
  commentCount,
  viewCount,
  isHot,
  boardType,
}: PostCardProps) {
  return (
    <Card className="hover:bg-surface/50 transition-colors cursor-pointer">
      <CardContent className="p-4 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Badge variant="default">{boardTypeLabels[boardType]}</Badge>
          {isHot && <Badge variant="hot">HOT 🔥</Badge>}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-text-primary line-clamp-2">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-text-secondary line-clamp-2">{content}</p>

        <Divider />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-3">
            <span>{authorNickname}</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>👍 {formatNumber(likeCount)}</span>
            <span>💬 {formatNumber(commentCount)}</span>
            <span>👁 {formatNumber(viewCount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

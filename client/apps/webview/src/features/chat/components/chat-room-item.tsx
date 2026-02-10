'use client'

import { Card, CardContent, Badge } from '@ui/index'
import { formatRelativeTime } from '@/lib/utils'

interface ChatRoomItemProps {
  id: string
  roomType: 'BUILDING' | 'TOPIC'
  topicName?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export default function ChatRoomItem({
  roomType,
  topicName,
  lastMessage,
  lastMessageAt,
  unreadCount = 0,
}: ChatRoomItemProps) {
  const displayName = roomType === 'BUILDING' ? '🏢 건물 전체 채팅' : topicName || '주제 채팅'

  return (
    <Card className="hover:bg-surface/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-primary truncate">
                {displayName}
              </h3>
              {unreadCount > 0 && (
                <Badge variant="primary">{unreadCount}</Badge>
              )}
            </div>
            {lastMessage && (
              <p className="text-sm text-text-secondary truncate">
                {lastMessage}
              </p>
            )}
          </div>
          {lastMessageAt && (
            <span className="text-xs text-text-tertiary ml-2 shrink-0">
              {formatRelativeTime(lastMessageAt)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

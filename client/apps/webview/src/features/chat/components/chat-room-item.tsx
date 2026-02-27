'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ShoppingCart, Gift, Home, MessageCircle, Store, UserRound } from 'lucide-react'
import { getTimeAgo } from '@/lib/utils'

export type BoardType = 'togather' | 'share' | 'lifestyle' | 'chat' | 'market' | 'personal'

export interface ChatRoom {
  id: number
  boardType: BoardType
  title: string
  participantCount?: number
  isGroup: boolean
  imageUrl?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface BoardConfig {
  icon: LucideIcon
  color: string
  bgColor: string
}

const BOARD_CONFIG: Record<BoardType, BoardConfig> = {
  // 게시판 타입별 아이콘/컬러는 커뮤니티 태그(TAG_ICONS)와 통일
  togather: { icon: ShoppingCart, color: '#fd6174', bgColor: '#fff7f9' },
  share: { icon: Gift, color: '#7ba8f0', bgColor: '#f5f7ff' },
  lifestyle: { icon: Home, color: '#ff8e60', bgColor: '#fff6f0' },
  chat: { icon: MessageCircle, color: '#4ccf89', bgColor: '#f4fbf7' },
  market: { icon: Store, color: '#a88af8', bgColor: '#f7f3ff' },
  personal: { icon: UserRound, color: '#4ccf89', bgColor: '#f4fbf7' },
}

interface Props {
  room: ChatRoom
  onClick: () => void
}

export default function ChatRoomItem({ room, onClick }: Props) {
  const config = BOARD_CONFIG[room.boardType] ?? BOARD_CONFIG.chat
  const Icon = config.icon

  return (
    <motion.button
      className="w-full flex items-center gap-3.5 px-5 py-4 text-left active:bg-gray-50 transition-colors"
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
    >
      {/* 프로필 이미지 + 뱃지 */}
      <div className="relative shrink-0 w-14 h-14">
        {room.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.imageUrl}
            alt={room.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: config.bgColor }}
          >
            <Icon size={26} style={{ color: config.color }} />
          </div>
        )}

        {/* boardType 뱃지: 실제 프로필/게시글 이미지가 있을 때만 노출 */}
        {room.imageUrl && (
          <div
            className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md border-2 border-white"
            style={{ backgroundColor: config.color }}
          >
            <Icon size={11} color="white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0">
        {/* 제목 행 */}
        <div className="flex items-baseline justify-between gap-2 mb-[3px]">
          <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
            <span className="font-semibold text-[15px] text-text-primary truncate leading-tight">
              {room.title}
            </span>
            {room.isGroup && room.participantCount != null && (
              <span className="text-xs text-text-tertiary shrink-0 font-medium">
                {room.participantCount}
              </span>
            )}
          </div>
          <span className="text-xs text-text-tertiary shrink-0">
            {getTimeAgo(room.lastMessageAt)}
          </span>
        </div>

        {/* 마지막 메시지 행 */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-text-secondary truncate leading-snug">
            {room.lastMessage}
          </span>
          {room.unreadCount > 0 && (
            <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

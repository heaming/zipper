'use client'

/**
 * 채팅 목록 페이지
 * TODO: MOCK_ROOMS → useChatRooms() API 연결 후 교체
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import ChatRoomItem, { type ChatRoom } from '@features/chat/components/chat-room-item'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 1,
    boardType: 'togather',
    title: '푸라닭 콘소메이징 같이 시키실 분~',
    participantCount: 3,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '그럼 푸라닭 콘소메이징으로 주문할게요!',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 2,
  },
  {
    id: 2,
    boardType: 'share',
    title: '육아대장',
    participantCount: 5,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '오후 6시쯤 가지러 가도 될까요?',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 3,
    boardType: 'togather',
    title: '마라처돌이',
    participantCount: 4,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '입금 확인했습니다! 곧 주문할게요.',
    lastMessageAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 4,
    boardType: 'personal',
    title: '헤미',
    isGroup: false,
    imageUrl: undefined,
    lastMessage: '분리수거장 위치 알려주셔서 감사합니다!',
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 5,
    boardType: 'togather',
    title: '생수 2L 12병 공구방',
    participantCount: 6,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '다들 어디쯤이신가요?',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 6,
    boardType: 'chat',
    title: '우리 동네 잡담방',
    participantCount: 12,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '오늘 날씨 진짜 좋네요~',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 5,
  },
  {
    id: 7,
    boardType: 'market',
    title: '유아용품 나눔/판매',
    participantCount: 8,
    isGroup: true,
    imageUrl: undefined,
    lastMessage: '혹시 아직 남아있나요?',
    lastMessageAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
]
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { label: string; value: string }[] = [
  { label: '전체', value: 'all' },
  { label: '같이사요', value: 'togather' },
  { label: '나눔', value: 'share' },
  { label: '일반', value: 'general' },
]

export default function ChatPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')

  const filteredRooms = MOCK_ROOMS.filter((room) => {
    if (activeTab === 'all') return true
    if (activeTab === 'general') return !['togather', 'share'].includes(room.boardType)
    return room.boardType === activeTab
  })

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="px-5 pt-4 pb-1">
          <h1 className="text-xl font-bold text-text-primary">채팅</h1>
        </div>

        {/* 탭 */}
        <div className="flex px-5 gap-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                className="relative py-3 text-sm font-medium transition-colors duration-150"
                style={{ color: isActive ? '#4ccf89' : '#9CA3AF' }}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="chat-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full"
                    style={{ backgroundColor: '#4ccf89' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* 채팅 목록 */}
      <main className="flex-1 divide-y divide-border/60">
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">채팅방이 없어요</p>
          </div>
        )}

        {filteredRooms.map((room) => (
          <ChatRoomItem
            key={room.id}
            room={room}
            onClick={() => router.push(`/chat/${room.id}`)}
          />
        ))}
      </main>
    </div>
  )
}

'use client'

/**
 * 채팅방 상세 페이지
 *
 * 아키텍처:
 *   - useInfiniteQuery: 초기 메시지 로드 + 위로 스크롤 시 과거 메시지 로드
 *   - useChatSocket: 실시간 신규 메시지 수신
 *   - 신규 메시지는 로컬 state에 append (쿼리 캐시 오염 방지)
 */

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Send, Loader2 } from 'lucide-react'
import { useChatMessages } from '@features/chat/hooks/use-chat-messages'
import { useChatSocket } from '@features/chat/hooks/use-chat-socket'
import { useAuthStore } from '@/stores/auth-store'
import { formatRelativeTime } from '@/lib/utils'
import type { ChatMessage } from '@zipper/api-client'

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId: roomIdStr } = use(params)
  const roomId = parseInt(roomIdStr)
  const router = useRouter()
  const { user } = useAuthStore()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChatMessages(roomId)

  // 실시간으로 수신된 신규 메시지 (소켓)
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({})
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setLiveMessages((prev) => [...prev, message])
  }, [])

  const handleUserTyping = useCallback(
    ({ userId, nickname }: { userId: number; nickname: string }) => {
      if (userId === user?.id) return
      setTypingUsers((prev) => ({ ...prev, [userId]: nickname }))
    },
    [user?.id],
  )

  const handleUserStoppedTyping = useCallback(({ userId }: { userId: number }) => {
    setTypingUsers((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }, [])

  const { isConnected, sendMessage, startTyping, stopTyping } = useChatSocket({
    roomId,
    onNewMessage: handleNewMessage,
    onUserTyping: handleUserTyping,
    onUserStoppedTyping: handleUserStoppedTyping,
  })

  // 신규 메시지 수신 시 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessages])

  // 기존 메시지(쿼리) 로드 완료 후 최초 스크롤
  useEffect(() => {
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }
  }, [isLoading])

  // 이전 메시지 불러오기 (스크롤 맨 위 도달)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget
      if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || !isConnected) return
    sendMessage(text)
    setInputText('')
    stopTyping()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    startTyping()
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(stopTyping, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 쿼리에서 불러온 기존 메시지 (오래된 순)
  const historicalMessages =
    data?.pages
      .slice()
      .reverse()
      .flatMap((page) => page.messages) ?? []

  const allMessages = [...historicalMessages, ...liveMessages]

  const typingNicknames = Object.values(typingUsers)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border flex items-center px-4 py-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="mr-3 text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-text-primary">채팅방</h1>
          <p className="text-xs text-text-tertiary">
            {isConnected ? '연결됨' : '연결 중...'}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        onScroll={handleScroll}
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {allMessages.map((msg) => {
          const isMe = msg.senderNickname === user?.nickname
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-xs text-text-tertiary mb-1 ml-1">
                    {msg.senderNickname}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-surface border border-border text-text-primary rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[11px] text-text-tertiary mt-1 mx-1">
                  {formatRelativeTime(msg.createdAt)}
                </span>
              </div>
            </div>
          )
        })}

        {typingNicknames.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-text-tertiary">
              {typingNicknames.join(', ')}님이 입력 중...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-surface border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력..."
            className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

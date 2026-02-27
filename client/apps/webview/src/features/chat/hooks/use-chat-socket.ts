'use client'

/**
 * useChatSocket — Socket.IO 실시간 채팅 훅
 *
 * WebView 고려사항:
 *   - transports: ['websocket'] — WebView에서 polling은 CORS 이슈 발생 가능
 *   - auth.token: handshake 단계에서 JWT 전달 (쿠키 없음)
 *   - 컴포넌트 언마운트 시 leave-room + disconnect 자동 처리
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import type { ChatMessage } from '@zipper/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface SocketChatMessage extends Omit<ChatMessage, 'roomId'> {
  roomId: number
  senderId: number
}

interface UseChatSocketOptions {
  roomId: number
  onNewMessage: (message: SocketChatMessage) => void
  onUserTyping?: (data: { userId: number; nickname: string }) => void
  onUserStoppedTyping?: (data: { userId: number }) => void
}

export function useChatSocket({
  roomId,
  onNewMessage,
  onUserTyping,
  onUserStoppedTyping,
}: UseChatSocketOptions) {
  const { accessToken } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!accessToken) return

    const socket = io(`${API_URL}/chat`, {
      auth: { token: accessToken },
      // WebView 환경: websocket 우선, polling fallback
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const handleConnect = () => {
      setIsConnected(true)
      socket.emit('join-room', { roomId: String(roomId) })
    }

    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('new-message', onNewMessage)
    socket.on('connect_error', (err) => {
      console.error('[Chat Socket] 연결 오류:', err.message)
    })

    if (onUserTyping) socket.on('user-typing', onUserTyping)
    if (onUserStoppedTyping) socket.on('user-stopped-typing', onUserStoppedTyping)

    socketRef.current = socket

    return () => {
      if (socket.connected) {
        socket.emit('leave-room', { roomId: String(roomId) })
      }
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('new-message', onNewMessage)
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, roomId]) // onNewMessage 등 콜백은 ref로 안정화하지 않아도 무방 (effect 재실행 허용)

  const sendMessage = useCallback(
    (content: string, messageType: 'TEXT' | 'IMAGE' = 'TEXT', imageUrl?: string) => {
      if (!socketRef.current?.connected) return false
      socketRef.current.emit('send-message', {
        roomId: String(roomId),
        content,
        messageType,
        imageUrl,
      })
      return true
    },
    [roomId],
  )

  const startTyping = useCallback(() => {
    socketRef.current?.emit('typing-start', { roomId: String(roomId) })
  }, [roomId])

  const stopTyping = useCallback(() => {
    socketRef.current?.emit('typing-stop', { roomId: String(roomId) })
  }, [roomId])

  return { isConnected, sendMessage, startTyping, stopTyping }
}

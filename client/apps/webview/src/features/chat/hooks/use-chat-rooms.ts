'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

export function useChatRooms() {
  const { user } = useAuthStore()
  const buildingId = user?.buildingId

  return useQuery({
    queryKey: ['chat-rooms', buildingId],
    queryFn: () => api.chat.getRooms(buildingId!),
    enabled: !!buildingId,
    // 채팅 목록은 자주 변경되므로 짧은 staleTime
    staleTime: 30_000,
    refetchInterval: 60_000, // 1분마다 폴링 (소켓 보조)
  })
}

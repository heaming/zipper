'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useChatMessages(roomId: number) {
  return useInfiniteQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: ({ pageParam }) =>
      api.chat.getMessages(roomId, {
        before: pageParam as string | undefined,
        limit: 50,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      // 마지막 페이지의 첫 메시지(oldest)의 createdAt을 커서로 사용
      const oldest = allPages.at(-1)?.messages.at(0)
      return oldest?.createdAt
    },
    staleTime: Infinity, // 소켓으로 실시간 갱신하므로 캐시 만료 없음
  })
}

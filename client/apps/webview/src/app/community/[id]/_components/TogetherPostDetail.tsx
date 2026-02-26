'use client'

import { useState, useCallback } from 'react'
import { MapPin, Clock, MessageCircle, Zap, Bell } from 'lucide-react'
import { Button } from '@ui/index'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { formatDeadline } from '@/features/community/utils/board-type.utils'
import { motion } from 'framer-motion'

interface Post {
  id: number
  title: string
  content: string
  boardType?: string | null
  tag?: string | null
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  isLiked?: boolean
  imageUrls?: string[]
  author?: {
    id: number
    nickname: string
  }
  meta?: {
    quantity?: number
    deadline?: string
    locationDetail?: string
    extraData?: Record<string, any>
  }
  participantCount?: number
  isParticipating?: boolean
  chatRoomId?: number
}

interface Props {
  post: Post
  postId: string
  onParticipantUpdate: (updates: { participantCount: number; isParticipating: boolean }) => void
}

export function TogetherPostDetail({ post, postId, onParticipantUpdate }: Props) {
  const [isJoining, setIsJoining] = useState(false)
  
  const category = post.tag || post.meta?.extraData?.category || null
  const isDelivery = category === '배달' || category === 'DELIVERY'
  const isGroupBuy = category === '공구' || category === 'GROUP_BUY'
  
  const currentParticipants = post.participantCount || 1
  const maxParticipants = post.meta?.quantity || 0
  const isFull = maxParticipants > 0 && currentParticipants >= maxParticipants
  const remainingSlots = Math.max(0, maxParticipants - currentParticipants)

  const handleJoin = useCallback(async () => {
    if (isFull) {
      alert('알림받기 기능은 곧 구현될 예정입니다.')
      return
    }

    if (isJoining) return

    try {
      setIsJoining(true)
      const result = await apiClient.joinTogatherPost(Number(postId))
      
      onParticipantUpdate({
        participantCount: result.participantCount,
        isParticipating: true,
      })
      
      alert(result.message || '참여했습니다.')
    } catch (error: any) {
      console.error('Failed to join togather post:', error)
      alert(error?.message || '참여에 실패했습니다.')
    } finally {
      setIsJoining(false)
    }
  }, [isFull, isJoining, postId, onParticipantUpdate])

  return (
    <>
      {/* 만남장소 | 마감시간 */}
      <div className="flex gap-2 mt-4">
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 mb-1">만남 장소</div>
          <div className="flex items-center gap-1.5 text-sm text-text-primary">
            <MapPin className="w-3.5 h-3.5 text-[#7ba8f0]" strokeWidth={1.5} />
            <span>{post.meta?.locationDetail && post.meta.locationDetail.trim() ? post.meta.locationDetail : '미정'}</span>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 mb-1">마감 시간</div>
          <div className="flex items-center gap-1.5 text-sm text-text-primary">
            <Clock className="w-3.5 h-3.5 text-[#ff8e60]" strokeWidth={1.5} />
            <span>{post.meta?.deadline ? formatDeadline(post.meta.deadline) : '미정'}</span>
          </div>
        </div>
      </div>

      {/* 모집인원 및 참여 버튼 */}
      <div className="mt-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          {maxParticipants > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2">모집 인원</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, maxParticipants > 0 ? (currentParticipants / maxParticipants) * 100 : 0)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#4ccf89] rounded-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className={cn("font-semibold", isFull ? "text-green-500" : "text-[#4ccf89]")}>
                    {currentParticipants}
                  </span>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-500">{maxParticipants}명</span>
                </div>
              </div>
            </div>
          )}

          {post.isParticipating ? (
            <Button
              fullWidth
              onClick={() => {
                if (post.chatRoomId) {
                  alert('채팅방 입장 기능은 곧 구현될 예정입니다.')
                }
              }}
              className="mb-2 border border-primary bg-white hover:bg-white text-primary shadow-md shadow-green-100 font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-1" strokeWidth={2.5} />
              채팅방 입장
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={handleJoin}
              disabled={isJoining}
              className={cn(
                "mb-2",
                isFull
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#4ccf89] text-white hover:bg-[#45b880]"
              )}
            >
              {isJoining ? (
                <>로딩 중...</>
              ) : isFull ? (
                <>
                  <Bell className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  알림받기
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  참여하기
                </>
              )}
            </Button>
          )}

          <div className="text-xs text-center text-gray-500">
            {isFull ? (
              "모집이 완료되었습니다! 참여가 가능해지면 알려드릴까요?"
            ) : maxParticipants > 0 ? (
              `${remainingSlots}명 더 모이면 성사돼요!`
            ) : (
              "참여하기 버튼을 눌러주세요!"
            )}
          </div>
        </div>
      </div>
    </>
  )
}

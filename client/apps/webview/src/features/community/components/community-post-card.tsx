'use client'

import Link from 'next/link'
import { User, MessageCircle, Home as HomeIcon, MapPin, Clock, Pizza, ShoppingBasket, Users } from 'lucide-react'
import { Card, CardContent, Divider } from '@ui/index'
import { PostTagBadge } from './post-tag-badge'
import { getTimeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Post {
  id: number
  title: string
  content: string
  boardType: string
  tag?: string | null
  likeCount: number
  commentCount: number
  viewCount?: number
  createdAt: string
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
}

interface CommunityPostCardProps {
  post: Post
  showAuthor?: boolean
  href?: string
}

export function CommunityPostCard({ post, showAuthor = true, href }: CommunityPostCardProps) {
  const postHref = href || `/community/${post.id}`
  const hasImages = post.imageUrls && post.imageUrls.length > 0
  const firstImage = hasImages ? post.imageUrls[0] : null
  const remainingImageCount = hasImages && post.imageUrls.length > 1 ? post.imageUrls.length - 1 : 0
  
  const isTogather = post.boardType === 'togather'
  const category = post.tag || post.meta?.extraData?.category || null
  const isDelivery = category === '배달' || category === 'DELIVERY'
  const isGroupBuy = category === '공구' || category === 'GROUP_BUY'
  
  // 디버깅용 로그
  if (isTogather) {
    console.log('[CommunityPostCard] Togather post:', {
      id: post.id,
      boardType: post.boardType,
      tag: post.tag,
      meta: post.meta,
      extraData: post.meta?.extraData,
      category,
      isDelivery,
      isGroupBuy,
    })
  }
  
  // 날짜 포맷팅 함수
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    try {
      const date = new Date(deadline)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const diffDays = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM'
      const displayHours = date.getHours() > 12 ? String(date.getHours() - 12) : String(date.getHours() || 12)
      
      if (diffDays === 0) {
        return `오늘 ${ampm} ${displayHours}:${minutes}`
      } else if (diffDays === 1) {
        return `내일 ${ampm} ${displayHours}:${minutes}`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${ampm} ${displayHours}:${minutes}`
      }
    } catch {
      return null
    }
  }
  
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-2">
      <CardContent className="px-4 pt-4 pb-3">
        {/* Tag Badge */}
        <div className="flex items-center gap-2">
          <PostTagBadge boardType={post.boardType} />
          {isTogather && (isDelivery || isGroupBuy) && (
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]  mb-2 font-bold",
              "bg-white ",
              isDelivery && "text-[#7ba8f0] bg-blue-50",
              isGroupBuy && "text-[#ff8e60] bg-orange-50"
            )}>
              {isDelivery ? (
                <>
                  <Pizza className="w-2.5 h-2.5" strokeWidth={1.5} />
                  <span>배달</span>
                </>
              ) : (
                <>
                  <ShoppingBasket className="w-2.5 h-2.5" strokeWidth={1.5} />
                  <span>공구</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title and Content with optional Image */}
        <div className={cn(
          "flex gap-3",
          hasImages && "items-start"
        )}>
          <div className={cn(
            "flex-1",
            hasImages && "min-w-0"
          )}>
            {/* Title */}
            <h3 className="font-bold text-text-primary mb-2 line-clamp-2 text-lg">
              {post.title}
            </h3>

            {/* Content Preview - 같이사요 게시글은 내용 제외 */}
            {!isTogather && post.content && (
              <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                {post.content}
              </p>
            )}

            {/* 같이사요 게시글: 장소/시간 정보 */}
            {isTogather && (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{post.meta?.locationDetail && post.meta.locationDetail.trim() ? post.meta.locationDetail : '미정'}</span>
                </div>
                {post.meta?.deadline && (
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{formatDeadline(post.meta.deadline)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          {hasImages && firstImage && (
            <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 mb-2 border border-1 border-zinc-300">
              <img
                src={firstImage}
                alt="게시글 이미지"
                className="w-full h-full object-cover"
              />
              {remainingImageCount > 0 && (
                <div className="absolute top-1 right-1">
                  <div className="bg-gray-600/80 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                    +{remainingImageCount}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Divider />

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-text-tertiary mt-2">
          <div className="flex items-center gap-3">
            {showAuthor && post.author && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                {post.author.nickname || '익명'}
              </span>
            )}
            {!isTogather && <span>{getTimeAgo(post.createdAt)}</span>}
          </div>
          {/*{cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]  mb-2 font-bold",
              "bg-white ",
              isDelivery && "text-[#7ba8f0] bg-blue-50",
              isGroupBuy && "text-[#ff8e60] bg-orange-50"
            )}*/}
          <div className={cn(
            "flex items-center",
            isTogather && post.meta?.quantity && (() => {
              const currentParticipants = post.participantCount || 1
              const maxParticipants = post.meta.quantity
              const isFull = currentParticipants >= maxParticipants
              return cn(
                "gap-3 px-2 rounded-sm",
                isFull ? "bg-[#fee2e7]" : "bg-green-50"
              )
            })(),
            !isTogather && "gap-2"
          )}>
            {isTogather && post.meta?.quantity && (() => {
              const currentParticipants = post.participantCount || 1
              const maxParticipants = post.meta.quantity
              const isFull = currentParticipants >= maxParticipants
              const togatherColor = '#fd6174' // 같이가요 아이콘의 붉은색
              
              return (
                <span className="flex items-center gap-2">
                  <Users 
                    className="w-3.5 h-3.5" 
                    strokeWidth={1.5}
                    style={{ color: isFull ? togatherColor : '#4ccf89' }}
                  />
                  <div>
                    <span 
                      className={cn("mr-0.5", isFull ? "" : "text-[#4ccf89]")}
                      style={{ color: isFull ? togatherColor : undefined }}
                    >
                      {currentParticipants}
                    </span>
                    <span 
                      className={cn("mr-0.5", isFull ? "" : "text-[#4ccf89]")}
                      style={{ color: isFull ? togatherColor : undefined }}
                    >
                      /
                    </span>
                    <span 
                      className={cn("mr-0.5", isFull ? "" : "text-[#4ccf89]")}
                      style={{ color: isFull ? togatherColor : undefined }}
                    >
                      {maxParticipants}
                    </span>
                  </div>
                </span>
              )
            })()}
            {!isTogather && (
              <>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {post.commentCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <HomeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {post.likeCount}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Link href={postHref}>
      {content}
    </Link>
  )
}

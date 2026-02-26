'use client'

import { Pizza, ShoppingBasket } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Post {
  boardType?: string | null
  tag?: string | null
  meta?: {
    extraData?: Record<string, any>
  }
}

interface Props {
  post: Post
}

export function TogetherPostTag({ post }: Props) {
  const category = post.tag || post.meta?.extraData?.category || null
  const isDelivery = category === '배달' || category === 'DELIVERY'
  const isGroupBuy = category === '공구' || category === 'GROUP_BUY'

  // 배달|공구 태그가 없으면 아무것도 표시하지 않음
  if (!isDelivery && !isGroupBuy) {
    return null
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      {(isDelivery || isGroupBuy) && (
        <div className={cn(
          "inline-flex items-center gap-1 px-1.5 mb-2 py-0.5 rounded text-[11px] font-bold",
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
  )
}

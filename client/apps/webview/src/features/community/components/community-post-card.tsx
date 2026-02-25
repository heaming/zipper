'use client'

import Link from 'next/link'
import { User, MessageCircle, Home as HomeIcon } from 'lucide-react'
import { Card, CardContent, Divider } from '@ui/index'
import { PostTagBadge } from './post-tag-badge'
import { getTimeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Post {
  id: number
  title: string
  content: string
  boardType: string
  likeCount: number
  commentCount: number
  viewCount?: number
  createdAt: string
  imageUrls?: string[]
  author?: {
    id: number
    nickname: string
  }
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
  
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        {/* Tag Badge */}
        <PostTagBadge boardType={post.boardType} />

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
            <h3 className="font-medium text-text-primary mb-2 line-clamp-2">
              {post.title}
            </h3>

            {/* Content Preview */}
            {post.content && (
              <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                {post.content}
              </p>
            )}
          </div>

          {/* Image Section */}
          {hasImages && firstImage && (
            <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
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
        <div className="flex items-center justify-between text-sm text-text-tertiary mt-3">
          <div className="flex items-center gap-3">
            {showAuthor && post.author && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                {post.author.nickname || '익명'}
              </span>
            )}
            <span>{getTimeAgo(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <HomeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {post.likeCount}
            </span>
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

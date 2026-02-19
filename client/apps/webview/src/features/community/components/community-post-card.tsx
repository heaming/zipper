'use client'

import Link from 'next/link'
import { User, MessageCircle, Home as HomeIcon } from 'lucide-react'
import { Card, CardContent, Divider } from '@ui/index'
import { PostTagBadge } from './post-tag-badge'
import { getTimeAgo } from '@/lib/utils'

interface Post {
  id: number
  title: string
  content: string
  boardType: string
  likeCount: number
  commentCount: number
  viewCount?: number
  createdAt: string
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
  
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        {/* Tag Badge */}
        <PostTagBadge boardType={post.boardType} />

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

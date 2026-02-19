'use client'

import Link from 'next/link'
import { Card, CardContent, Divider } from '@ui/index'
import { PostTagBadge } from './post-tag-badge'
import { getTimeAgo } from '@/lib/utils'

interface Comment {
  id: number
  content: string
  postId: number
  postTitle: string
  boardType: string
  createdAt: string
}

interface CommentCardProps {
  comment: Comment
  href?: string
}

export function CommentCard({ comment, href }: CommentCardProps) {
  const postHref = href || `/community/${comment.postId}`
  
  return (
    <Link href={postHref}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* Post Title */}
          <PostTagBadge boardType={comment.boardType} />
          <h3 className="font-medium text-text-primary mb-2 line-clamp-1 text-sm">
            {comment.postTitle}
          </h3>

          {/* Comment Content */}
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {comment.content}
          </p>

          <Divider />

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-text-tertiary mt-3">
            <span>{getTimeAgo(comment.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

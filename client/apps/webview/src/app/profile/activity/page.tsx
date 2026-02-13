/**
 * 내 활동 내역 화면
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, MessageSquareReply, Home as HomeIcon, User, MessageCircle } from 'lucide-react'
import { Card, CardContent, Divider } from '@ui/index'
import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

type TabType = 'posts' | 'comments' | 'likes'

interface Post {
  id: number
  title: string
  content: string
  boardType: string
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  author?: {
    id: number
    nickname: string
  }
}

interface Comment {
  id: number
  content: string
  postId: number
  postTitle: string
  boardType: string
  createdAt: string
  author?: {
    id: number
    nickname: string
  }
}

interface LikedPost {
  id: number
  title: string
  content: string
  boardType: string
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  author?: {
    id: number
    nickname: string
  }
}


const tabs = [
  { id: 'posts' as TabType, label: '내가 쓴 글', icon: Pencil },
  { id: 'comments' as TabType, label: '내가 쓴 댓글', icon: MessageSquareReply },
  { id: 'likes' as TabType, label: '관심', icon: HomeIcon },
]

const tagColors: Record<CommunityTag, string> = {
  [CommunityTag.ALL]: '#4ccf89',
  [CommunityTag.TOGATHER]: '#fd6174',
  [CommunityTag.SHARE]: '#7ba8f0',
  [CommunityTag.LIFESTYLE]: '#ff8e60',
  [CommunityTag.CHAT]: '#4ccf89',
  [CommunityTag.MARKET]: '#a88af8',
}

export default function ActivityPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    return past.toLocaleDateString()
  }

  const getBoardTypeLabel = (boardType: string) => {
    const labels: Record<string, string> = {
      togather: '같이 사요',
      share: '나눔',
      lifestyle: 'ZIP 생활',
      chat: '잡담',
      market: '중고장터'
    }
    return labels[boardType] || boardType
  }

  const getTagClass = (boardType: string) => {
    return `tag-${boardType.toLowerCase()}`
  }

  const getBoardTypeCommunityTag = (boardType: string): CommunityTag => {
    const mapping: Record<string, CommunityTag> = {
      'togather': CommunityTag.TOGATHER,
      'share': CommunityTag.SHARE,
      'lifestyle': CommunityTag.LIFESTYLE,
      'chat': CommunityTag.CHAT,
      'market': CommunityTag.MARKET,
      'all': CommunityTag.ALL
    }
    return mapping[boardType.toLowerCase()] || CommunityTag.ALL
  }

  // API 호출 함수들
  const fetchMyPosts = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMyPosts(1, 50)
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch my posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMyComments = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMyComments(1, 50)
      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to fetch my comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMyLikedPosts = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMyLikedPosts(1, 50)
      setLikedPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch my liked posts:', error)
      setLikedPosts([])
    } finally {
      setLoading(false)
    }
  }

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    if (activeTab === 'posts') {
      fetchMyPosts()
    } else if (activeTab === 'comments') {
      fetchMyComments()
    } else if (activeTab === 'likes') {
      fetchMyLikedPosts()
    }
  }, [activeTab, isAuthenticated, router])

  const renderPosts = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>로딩 중...</p>
          </CardContent>
        </Card>
      )
    }

    if (posts.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>아직 작성한 글이 없습니다</p>
            <p className="text-sm mt-2">첫 번째 글을 작성해보세요!</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                {/* Tag Badge */}
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-2">
                  {(() => {
                    const tag = getBoardTypeCommunityTag(post.boardType)
                    const Icon = TAG_ICONS[tag]
                    const color = tagColors[tag]
                    return Icon ? (
                      <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} style={{ color }} />
                    ) : null
                  })()}
                  <span className="text-gray-400">
                    {getBoardTypeLabel(post.boardType)}
                  </span>
                </div>

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
          </Link>
        ))}
      </div>
    )
  }

  const renderComments = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>로딩 중...</p>
          </CardContent>
        </Card>
      )
    }

    if (comments.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>아직 작성한 댓글이 없습니다</p>
            <p className="text-sm mt-2">첫 번째 댓글을 작성해보세요!</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {comments.map((comment) => (
          <Link key={comment.id} href={`/community/${comment.postId}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                {/* Post Title */}
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-2">
                  {(() => {
                    const tag = getBoardTypeCommunityTag(comment.boardType)
                    const Icon = TAG_ICONS[tag]
                    const color = tagColors[tag]
                    return Icon ? (
                      <Icon className={cn("w-2.5 h-2.5", getTagClass(comment.boardType))} strokeWidth={1.5} style={{ color }} />
                    ) : null
                  })()}
                  <span className="text-gray-400">
                    {getBoardTypeLabel(comment.boardType)}
                  </span>
                </div>
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
        ))}
      </div>
    )
  }

  const renderLikes = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>로딩 중...</p>
          </CardContent>
        </Card>
      )
    }

    if (likedPosts.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center text-text-secondary">
            <p>아직 좋아요한 글이 없습니다</p>
            <p className="text-sm mt-2">마음에 드는 글에 좋아요를 눌러보세요!</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {likedPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                {/* Tag Badge */}
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-2">
                  {(() => {
                    const tag = getBoardTypeCommunityTag(post.boardType)
                    const Icon = TAG_ICONS[tag]
                    const color = tagColors[tag]
                    return Icon ? (
                      <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} style={{ color }} />
                    ) : null
                  })()}
                  <span className="text-gray-400">
                    {getBoardTypeLabel(post.boardType)}
                  </span>
                </div>

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
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {post.author?.nickname || '익명'}
                    </span>
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
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
              </button>
            </div>
            <h1 className="text-xl font-bold text-text-primary">내 활동 내역</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                )}
              >
                <Icon 
                  className="w-4 h-4"
                  strokeWidth={1.5} 
                />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'comments' && renderComments()}
        {activeTab === 'likes' && renderLikes()}
      </main>
    </div>
  )
}

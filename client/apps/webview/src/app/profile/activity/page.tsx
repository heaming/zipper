/**
 * 내 활동 내역 화면
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, MessageSquareReply, Home as HomeIcon } from 'lucide-react'
import { Card, CardContent } from '@ui/index'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { CommunityPostCard } from '@/features/community/components/community-post-card'
import { CommentCard } from '@/features/community/components/comment-card'

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

export default function ActivityPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)


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
          <CommunityPostCard key={post.id} post={post} showAuthor={false} />
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
          <CommentCard key={comment.id} comment={comment} />
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
          <CommunityPostCard key={post.id} post={post} />
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

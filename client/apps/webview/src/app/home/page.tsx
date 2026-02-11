/**
 * 홈 화면 (로그인 필요)
 * - 현재 소속 건물
 * - 핫한 이야기
 * - 최근 게시글
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, User, Home as HomeIcon, MessageCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@ui/index'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

interface Post {
  id: number
  title: string
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  boardType: string
  author?: {
    id: number
    email: string
  }
}

// Mock data for home page
const mockPosts: Post[] = [
  {
    id: 1,
    title: '같이 배달 시키실 분 구해요!',
    likeCount: 15,
    commentCount: 8,
    viewCount: 67,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    boardType: 'togather',
    author: { id: 1, email: 'kim@example.com' },
  },
  {
    id: 2,
    title: '책상 나눔합니다',
    likeCount: 12,
    commentCount: 5,
    viewCount: 45,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    boardType: 'share',
    author: { id: 2, email: 'lee@example.com' },
  },
  {
    id: 3,
    title: '우리 동네 맛집 추천해요',
    likeCount: 20,
    commentCount: 12,
    viewCount: 89,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    boardType: 'lifestyle',
    author: { id: 3, email: 'park@example.com' },
  },
  {
    id: 4,
    title: '오늘 날씨 정말 좋네요',
    likeCount: 8,
    commentCount: 3,
    viewCount: 34,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    boardType: 'chat',
    author: { id: 4, email: 'choi@example.com' },
  },
  {
    id: 5,
    title: '공구 같이 하실 분 모집합니다',
    likeCount: 18,
    commentCount: 7,
    viewCount: 56,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    boardType: 'togather',
    author: { id: 5, email: 'jung@example.com' },
  },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [hotPosts, setHotPosts] = useState<Post[]>([])
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 로그인 안 되어있으면 환영 페이지로 리다이렉트
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    // Mockdata 사용 (기존과 동일한 UI/UX 유지)
    loadMockPosts()
  }, [isAuthenticated, router])

  const loadMockPosts = () => {
    setLoading(true)
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      // HOT 게시글 (좋아요 10개 이상)
      const hot = mockPosts
        .filter((p) => p.likeCount >= 10)
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 3)
      
      // 최근 게시글
      const recent = mockPosts.slice(0, 5)
      
      setHotPosts(hot)
      setRecentPosts(recent)
      setLoading(false)
    }, 500)
  }

  // 로그인 안 되어있으면 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null
  }

  const userLevel = 5
  const notificationCount = 3
  const currentBuilding = `${user?.buildingName}${user?.dong ? " " +user?.dong : ''}`

  const handleLogout = () => {
    logout()
    router.push('/')
  }

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
      chat: '잡담'
    }
    return labels[boardType] || boardType
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">ZIPPER</h1>
            
            <div className="flex items-center gap-4">
              {/* 알림 */}
              <button className="relative p-2">
                <Bell className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* 내정보 아이콘 */}
              <Link href="/profile">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-text-tertiary mt-0.5">lv.{userLevel}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* 현재 건물 카드 */}
        <Card>
          <CardContent className="p-4 bg-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">우리집</p>
                <h2 className="text-sm font-bold text-text-secondary mt-1">
                  {currentBuilding}
                </h2>
              </div>
              <Link href="/profile">
                <button className="text-sm text-primary font-medium">
                  변경 →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Hot 게시글 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-primary">🔥 핫한 이야기</h3>
            <Link href="/community" className="text-sm text-text-tertiary">
              더보기 →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-secondary">
              로딩 중...
            </div>
          ) : hotPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-text-secondary">
                아직 인기 게시글이 없습니다
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {hotPosts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-text-primary line-clamp-1">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-text-tertiary">
                            <span className="flex items-center gap-1">
                              <HomeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                              {post.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                              {post.commentCount}
                            </span>
                            <span>{getTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-2" strokeWidth={1.5} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 최근 게시글 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-primary">최근 게시글</h3>
            <Link href="/community" className="text-sm text-text-tertiary">
              더보기 →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-secondary">
              로딩 중...
            </div>
          ) : recentPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-text-secondary">
                아직 게시글이 없습니다
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                {recentPosts.map((post, index) => (
                  <div key={post.id}>
                    <Link href={`/community/${post.id}`}>
                      <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-text-secondary rounded">
                              {getBoardTypeLabel(post.boardType)}
                            </span>
                            <p className="text-text-primary line-clamp-1 text-sm">
                              {post.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                            <span>{post.author?.email?.split('@')[0] || '익명'}</span>
                            <span>·</span>
                            <span>{getTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0 ml-2" strokeWidth={1.5} />
                      </div>
                    </Link>
                    {index < recentPosts.length - 1 && (
                      <div className="border-b border-border" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

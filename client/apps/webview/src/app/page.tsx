'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home as HomeIcon, MessageCircle, Lock, PenSquare, User } from 'lucide-react'
import { Button, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/index'
import { useAuthStore } from '@/stores/auth-store'
import { CommunityTag, TAG_ICONS, TAG_LABELS } from '@zipper/models/src/community'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

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

export default function PreviewPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [selectedTag, setSelectedTag] = useState<CommunityTag>(CommunityTag.TOGATHER)
  const [showLockDialog, setShowLockDialog] = useState(false)
  const [showWriteDialog, setShowWriteDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for preview page
  const mockPosts: Post[] = [
    {
      id: 1,
      title: '같이 배달 시키실 분 구해요!',
      content: '치킨 배달 같이 시키실 분 구합니다. 2만원 이상 주문 시 배달비 무료예요.',
      boardType: 'togather',
      likeCount: 12,
      commentCount: 5,
      viewCount: 45,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: { id: 1, nickname: '김동민' },
    },
    {
      id: 2,
      title: '책상 나눔합니다',
      content: '이사 가면서 책상 나눔합니다. 깨끗하게 사용했어요.',
      boardType: 'share',
      likeCount: 8,
      commentCount: 3,
      viewCount: 32,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      author: { id: 2, nickname: '이영희' },
    },
    {
      id: 3,
      title: '우리 동네 맛집 추천해요',
      content: '1층에 새로 생긴 카페 정말 좋아요. 분위기도 좋고 커피도 맛있어요.',
      boardType: 'lifestyle',
      likeCount: 15,
      commentCount: 7,
      viewCount: 67,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: 3, nickname: '박철수' },
    },
    {
      id: 4,
      title: '오늘 날씨 정말 좋네요',
      content: '창문 열고 있으니 바람이 시원하게 들어와요. 다들 환기 잘 하세요!',
      boardType: 'chat',
      likeCount: 5,
      commentCount: 2,
      viewCount: 23,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      author: { id: 4, nickname: '최미영' },
    },
  ]

  useEffect(() => {
    // 로그인되어 있으면 홈으로 리다이렉트
    if (isAuthenticated) {
      router.push('/home')
      return
    }
    
    // 미리보기 페이지에서는 mockdata 사용 (인증 불필요)
    loadMockPosts()
  }, [selectedTag, isAuthenticated, router])

  const loadMockPosts = () => {
    setLoading(true)
    // 태그에 따라 필터링
    let filteredPosts = mockPosts
    if (selectedTag !== CommunityTag.ALL) {
      const tagMap: Record<CommunityTag, string> = {
        [CommunityTag.ALL]: 'all',
        [CommunityTag.TOGATHER]: 'togather',
        [CommunityTag.SHARE]: 'share',
        [CommunityTag.LIFESTYLE]: 'lifestyle',
        [CommunityTag.CHAT]: 'chat',
        [CommunityTag.MARKET]: 'market',
      }
      filteredPosts = mockPosts.filter(
        (post) => post.boardType === tagMap[selectedTag]
      )
    }
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      setPosts(filteredPosts)
      setLoading(false)
    }, 500)
  }

  // 로그인되어 있으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (isAuthenticated) {
    return null
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

  const getTagClass = (boardType: string) => {
    return `tag-${boardType.toLowerCase()}`
  }

  const getTagBgClass = (boardType: string) => {
    return `tag-bg-${boardType.toLowerCase()}`
  }

  const getBoardTypeLabel = (boardType: string) => {
    const labels: Record<string, string> = {
      togather: '같이 사요',
      share: '나눔',
      lifestyle: 'ZIP 생활',
      chat: '잡담',
      market: 'ZIP 마켓'
    }
    return labels[boardType] || boardType
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

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">ZIPPER</h1>
              <p className="text-xs text-text-secondary mt-0.5">우리 건물 사람들끼리 쓰는 커뮤니티</p>
            </div>
            <Link href="/auth/login">
              <Button size="sm">로그인</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={selectedTag} onValueChange={(v) => setSelectedTag(v as CommunityTag)}>
        <div className="sticky top-0 bg-surface border-b border-border z-10">
          <TabsList>
            <TabsTrigger value={CommunityTag.TOGATHER}>
              {(() => {
                const Icon = TAG_ICONS[CommunityTag.TOGATHER]
                return Icon && <Icon className="w-4 h-4 inline-block mr-1" strokeWidth={1.5} />
              })()}
              같이 사요
            </TabsTrigger>
            <TabsTrigger value={CommunityTag.SHARE}>
              {(() => {
                const Icon = TAG_ICONS[CommunityTag.SHARE]
                return Icon && <Icon className="w-4 h-4 inline-block mr-1" strokeWidth={1.5} />
              })()}
              나눔
            </TabsTrigger>
            <TabsTrigger value={CommunityTag.LIFESTYLE}>
              {(() => {
                const Icon = TAG_ICONS[CommunityTag.LIFESTYLE]
                return Icon && <Icon className="w-4 h-4 inline-block mr-1" strokeWidth={1.5} />
              })()}
              ZIP 생활
            </TabsTrigger>
            <TabsTrigger value={CommunityTag.CHAT}>
              {(() => {
                const Icon = TAG_ICONS[CommunityTag.CHAT]
                return Icon && <Icon className="w-4 h-4 inline-block mr-1" strokeWidth={1.5} />
              })()}
              잡담
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <main className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-12 text-text-secondary">
              로딩 중...
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-text-secondary">
                <p>아직 게시글이 없습니다</p>
                <p className="text-sm mt-2">첫 번째 글을 작성해보세요!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post: Post) => {
                const postTag = getBoardTypeCommunityTag(post.boardType)
                const Icon = TAG_ICONS[postTag]
                
                return (
                  <Card
                    key={post.id}
                    className="cursor-pointer active:scale-[0.99] transition-transform"
                    onClick={() => setShowLockDialog(true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50">
                              {Icon && <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} />}
                              <span className="text-gray-400">
                                {getBoardTypeLabel(post.boardType)}
                              </span>
                            </span>
                          </div>
                          <h3 className="text-base font-medium text-text-primary mb-1">
                            {post.title}
                          </h3>
                          {post.content && (
                            <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                              {post.content}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                              {post.author?.nickname || '익명'}
                            </span>
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
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Trust Message */}
          {!loading && (
            <div className="mt-8 py-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <p className="text-center">
                  ZIPPER는 같은 공간에 사는 사람들만<br />
                  참여할 수 있는 커뮤니티예요
                </p>
              </div>
            </div>
          )}
        </main>
      </Tabs>

      {/* Floating Write Button */}
      <button
        onClick={() => {
          // 인증되지 않았거나 인증 상태가 VERIFIED가 아니면 인증 유도 모달 표시
          const verificationStatus = user?.buildingVerificationStatus
          if (!isAuthenticated || !user || !verificationStatus || verificationStatus !== 'VERIFIED') {
            setShowVerificationDialog(true)
          } else {
            setShowWriteDialog(true)
          }
        }}
        className="fixed bottom-20 right-4 text-white px-6 py-3 rounded-full shadow-lg font-medium active:scale-95 transition-transform z-30 flex items-center gap-2"
        style={{
            backgroundImage: 'linear-gradient(to right top, #45b393, #44b892, #44be91, #45c38f, #47c88d, #54cc87, #61d081, #6ed37a, #85d56f, #9bd766, #b0d85d, #c5d856)'
        }}
      >
        <PenSquare className="w-5 h-5" strokeWidth={2} />
        <span>글쓰기</span>
      </button>

      {/* Lock Dialog - 게시글 클릭 시 */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-secondary" strokeWidth={1.5} />
              </div>
            </div>
            <DialogTitle>우리 동네 사람들만 볼 수 있어요</DialogTitle>
            <DialogDescription className="text-left space-y-2 pt-2">
              <p>이 게시글은</p>
              <p>✔ 같은 건물에 사는 주민만</p>
              <p>✔ 인증 후 열람할 수 있어요</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild fullWidth>
              <Link href="/auth/signup">우리 동네 인증하고 보기</Link>
            </Button>
            <Button variant="secondary" asChild fullWidth>
              <Link href="/auth/login">로그인</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Dialog - 글쓰기 버튼 클릭 시 */}
      <Dialog open={showWriteDialog} onOpenChange={setShowWriteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-secondary" strokeWidth={1.5} />
              </div>
            </div>
            <DialogTitle>글 작성은 우리 건물 인증 후 가능해요</DialogTitle>
            <DialogDescription>
              같은 건물에 사는 이웃들과 안전하게 소통하세요
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild fullWidth>
              <Link href="/auth/signup">로그인하고 시작하기</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

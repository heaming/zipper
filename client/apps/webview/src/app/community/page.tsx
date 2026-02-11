/**
 * 커뮤니티 화면 (태그 기반 탐색)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, MessageCircle, Home as HomeIcon, Pencil, X } from 'lucide-react'
import { Card, CardContent, Badge, Divider } from '@ui/index'
import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

const tags = [
  CommunityTag.ALL,
  CommunityTag.TOGATHER,
  CommunityTag.SHARE,
  CommunityTag.LIFESTYLE,
  CommunityTag.CHAT,
]

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

const writeOptions = [
  { tag: CommunityTag.TOGATHER, description: '공구·음식·배달 함께해요' },
  { tag: CommunityTag.SHARE, description: '무료로 나눠드려요' },
  { tag: CommunityTag.LIFESTYLE, description: '우리 동네 궁금해요' },
  { tag: CommunityTag.CHAT, description: '자유롭게 이야기해요' },
  { tag: CommunityTag.MARKET, description: '상업 광고 (권한 필요)' },
]

const tagColors: Record<CommunityTag, string> = {
  [CommunityTag.ALL]: '#4ccf89',
  [CommunityTag.TOGATHER]: '#fd6174',
  [CommunityTag.SHARE]: '#7ba8f0',
  [CommunityTag.LIFESTYLE]: '#ff8e60',
  [CommunityTag.CHAT]: '#4ccf89',
  [CommunityTag.MARKET]: '#a88af8',
}

export default function CommunityPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [activeTag, setActiveTag] = useState<CommunityTag>(CommunityTag.ALL)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [buildingId, setBuildingId] = useState<number | null>(null)
  const [showWriteMenu, setShowWriteMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    // 사용자 프로필에서 buildingId 가져오기
    const loadProfile = async () => {
      try {
        setLoadingProfile(true)
        const profile = await apiClient.getProfile()
        if (profile.buildings && profile.buildings.length > 0) {
          setBuildingId(profile.buildings[0].id)
        } else if (profile.buildingId) {
          setBuildingId(profile.buildingId)
        } else {
          // 건물 정보가 없으면 게시글을 불러오지 않음
          setPosts([])
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        setBuildingId(null)
        setPosts([])
        setLoading(false)
      } finally {
        setLoadingProfile(false)
      }
    }
    
    loadProfile()
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !buildingId || loadingProfile) return
    
    fetchPosts()
  }, [activeTag, isAuthenticated, buildingId, loadingProfile, router])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showWriteMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowWriteMenu(false)
      }
    }

    if (showWriteMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showWriteMenu])

  const fetchPosts = async () => {
    if (!buildingId) return
    
    try {
      setLoading(true)
      const boardType = activeTag === CommunityTag.ALL ? undefined : activeTag
      const data = await apiClient.getPosts(buildingId, boardType, 50)
      setPosts(data.posts || data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
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
    // boardType: 'togather', 'share', etc.
    return `tag-${boardType.toLowerCase()}`
  }

  const getTagBgClass = (boardType: string) => {
    return `tag-bg-${boardType.toLowerCase()}`
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
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text-primary">커뮤니티</h1>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {tags.map((tag) => {
            const Icon = TAG_ICONS[tag]
            const isActive = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                )}
              >
                {Icon && (
                  <Icon 
                    className="w-4 h-4"
                    strokeWidth={1.5} 
                  />
                )}
                <span>
                  {TAG_LABELS[tag]}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {loading || loadingProfile ? (
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
            {posts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    {/* Tag Badge */}
                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-2">
                      {(() => {
                        const tag = getBoardTypeCommunityTag(post.boardType)
                        const Icon = TAG_ICONS[tag]
                        return Icon ? (
                          <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} />
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
        )}
      </main>

      {/* Floating Write Button & Menu */}
      <div className="fixed bottom-20 right-4 z-30">
        {/* Write Menu */}
        {showWriteMenu && (
          <div
            ref={menuRef}
            className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden mb-2"
          >
            {writeOptions.map((option, index) => {
              const Icon = TAG_ICONS[option.tag]
              const color = tagColors[option.tag]
              return (
                <Link
                  key={option.tag}
                  href={`/write?tag=${option.tag}`}
                  onClick={() => setShowWriteMenu(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
                      index !== writeOptions.length - 1 && 'border-b border-gray-100'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        style={{ color }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">
                        {TAG_LABELS[option.tag]}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Write Button / X Button */}
        <button
          ref={buttonRef}
          onClick={() => setShowWriteMenu(!showWriteMenu)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center',
            showWriteMenu
              ? 'bg-white shadow shadow-lg border border-1 border-neutral-700'
              : 'text-white'
          )}
          style={
            showWriteMenu
              ? {
                  backgroundImage: 'linear-gradient(to bottom, #ffffff, #f7f7f7, #efefef, #e8e7e7, #e0dfdf)',
                }
              : {
                  backgroundImage: 'linear-gradient(to right top, #45b393, #44b892, #44be91, #45c38f, #47c88d, #54cc87, #61d081, #6ed37a, #85d56f, #9bd766, #b0d85d, #c5d856)',
                }
          }
        >
          {showWriteMenu ? (
            <X className="w-6 h-6" strokeWidth={2} style={{ color: '#2E2E2E' }} />
          ) : (
            <Pencil className="w-6 h-6" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  )
}

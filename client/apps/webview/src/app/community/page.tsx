/**
 * 커뮤니티 화면 (태그 기반 탐색)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, X } from 'lucide-react'
import { Card, CardContent } from '@ui/index'
import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { CommunityPostCard } from '@/features/community/components/community-post-card'

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
          setBuildingId(parseInt(String(profile.buildings[0].id), 10))
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
              <CommunityPostCard key={post.id} post={post} />
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

/**
 * 게시글 상세 페이지
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Home as HomeIcon, MessageCircle, User, ArrowUp, Lock, MoreVertical, Pencil, Trash2, Flag, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, Button, Divider, Badge, BottomSheet, BottomSheetContent } from '@ui/index'
import { CommunityTag, TAG_ICONS } from '@zipper/models/src/community'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

interface Post {
  id: number
  title: string
  content: string
  boardType?: string | null
  tag?: string | null
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  isLiked?: boolean
  imageUrls?: string[]
  author?: {
    id: number
    nickname: string
  }
}

interface Comment {
  id: number
  content: string
  createdAt: string
  parentCommentId?: number
  author?: {
    id: number
    nickname: string
  }
  authorNickname?: string
  authorId?: number
  replies?: Comment[]
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const { isAuthenticated, user } = useAuthStore()
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // 햄버거 메뉴 상태 관리
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  // 댓글 관련 state
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const [totalComments, setTotalComments] = useState(0)
  const commentsRef = useRef<Comment[]>([])
  
  // 인증 관련 state
  const [showVerificationSheet, setShowVerificationSheet] = useState(false)
  
  // 이미지 뷰어 관련 state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const imageViewerRef = useRef<HTMLDivElement>(null)
  
  // comments ref 동기화
  useEffect(() => {
    commentsRef.current = comments
  }, [comments])

  const fetchPost = async () => {
    try {
      const data = await apiClient.getPost(Number(postId))
      console.log('[PostDetail] Fetched post data:', data)
      console.log('[PostDetail] Image URLs:', data.imageUrls)
      setPost(data)
      
      // 좋아요 상태 초기화
      if (data.isLiked !== undefined) {
        setIsLiked(data.isLiked)
      }
      
      // 조회수 증가 (에러가 발생해도 무시)
      try {
        await apiClient.incrementView(Number(postId))
      } catch (viewError) {
        // 조회수 증가 실패는 무시 (이미 getPostById에서 조회수가 증가했을 수 있음)
        console.warn('Failed to increment view:', viewError)
      }
    } catch (error: any) {
      console.error('Failed to fetch post:', error)
      
      // 인증 관련 에러인 경우 Bottom Sheet 표시
      if (error?.message?.includes('인증') || error?.message?.includes('건물 인증')) {
        setShowVerificationSheet(true)
      } else {
        // 다른 에러는 그대로 표시
        alert(error?.message || '게시글을 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = useCallback(async (beforeId?: number) => {
    try {
      console.log('fetchComments called with beforeId:', beforeId)
      if (beforeId) {
        setLoadingMoreComments(true)
      } else {
        setLoading(true)
      }
      
      const data = await apiClient.getComments(Number(postId), 1, 20, beforeId)
      console.log('API response:', data)
      
      // 답글 중복 제거 함수
      const deduplicateReplies = (replies: Comment[]) => {
        const seen = new Set<number>()
        return replies.filter(reply => {
          if (seen.has(reply.id)) {
            return false
          }
          seen.add(reply.id)
          return true
        })
      }
      
      // 각 댓글의 답글 중복 제거 및 author 정보 정규화
      const cleanedComments = data.comments.map(comment => ({
        ...comment,
        author: comment.author || (comment.authorNickname ? {
          id: comment.authorId || 0,
          nickname: comment.authorNickname
        } : undefined),
        replies: comment.replies ? deduplicateReplies(comment.replies.map((reply: any) => ({
          ...reply,
          author: reply.author || (reply.authorNickname ? {
            id: reply.authorId || 0,
            nickname: reply.authorNickname
          } : undefined)
        }))) : []
      }))
      
      console.log('Cleaned comments:', cleanedComments.length)
      
      if (beforeId) {
        // 이전 댓글을 위에 추가
        setComments(prev => {
          const existingIds = new Set(prev.map(c => c.id))
          // 답글 ID도 모두 수집
          prev.forEach(c => {
            if (c.replies) {
              c.replies.forEach(r => existingIds.add(r.id))
            }
          })
          const newComments = cleanedComments.filter(c => !existingIds.has(c.id))
          console.log('Adding older comments:', newComments.length, 'to existing:', prev.length)
          return [...newComments, ...prev]
        })
      } else {
        // 최초 진입: 최신 댓글만 표시
        setComments(cleanedComments)
      }
      
      setHasMoreComments(data.hasMore ?? false)
      setTotalComments(data.total)
      
      console.log('Comments fetched:', {
        beforeId,
        hasMore: data.hasMore,
        totalComments: cleanedComments.length,
        totalCount: data.total,
      })
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      if (beforeId) {
        setLoadingMoreComments(false)
      } else {
        setLoading(false)
      }
    }
  }, [postId])

  const loadOlderComments = useCallback(async () => {
    if (loadingMoreComments) {
      console.log('Already loading, skipping...')
      return
    }
    
    if (!hasMoreComments) {
      console.log('No more comments to load')
      return
    }
    
    // 현재 보이는 댓글 중 가장 오래된 댓글의 ID (ref 사용)
    const currentComments = commentsRef.current
    const oldestCommentId = currentComments.length > 0 ? currentComments[0].id : undefined
    if (!oldestCommentId) {
      console.log('No oldest comment ID found')
      return
    }
    
    console.log('Loading older comments, beforeId:', oldestCommentId, 'current comments:', currentComments.length)
    await fetchComments(oldestCommentId)
  }, [fetchComments, loadingMoreComments, hasMoreComments])

  const handleLike = async () => {
    if (!post) return
    
    try {
      // 낙관적 업데이트
      const newLikedState = !isLiked
      setIsLiked(newLikedState)
      setPost({
        ...post,
        likeCount: newLikedState ? post.likeCount + 1 : post.likeCount - 1
      })
      
      // API 호출
      const result = await apiClient.toggleLike(Number(postId))
      
      // API 결과로 다시 동기화
      if (result.liked !== newLikedState) {
        setIsLiked(result.liked)
        await fetchPost()
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // 에러 시 원래 상태로 복구
      setIsLiked(!isLiked)
      await fetchPost()
    }
  }

  // @닉네임을 강조해서 렌더링하는 함수
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\S+)/g)
    
    return (
      <>
        {parts.map((part, index) => 
          part.startsWith('@') ? (
            <span key={index} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    )
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim() || !post) return
    
    try {
      setSubmitting(true)
      
      // 답글 모드일 때 @닉네임을 앞에 자동으로 추가
      const finalContent = replyTo 
        ? `@${replyTo} ${commentText}` 
        : commentText
      
      const newComment = await apiClient.createComment(Number(postId), finalContent, replyToCommentId || undefined)
      setCommentText('')
      setReplyTo(null) // 답글 상태 초기화
      setReplyToCommentId(null)
      
      // textarea 높이 reset
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px'
      }
      
      // 댓글 수 증가
      setPost({
        ...post,
        commentCount: post.commentCount + 1
      })
      
      // 답글인 경우 부모 댓글의 replies에 추가
      if (replyToCommentId) {
        // author 정보 정규화
        const normalizedReply = {
          ...newComment,
          author: newComment.author || (newComment.authorNickname ? {
            id: newComment.authorId || 0,
            nickname: newComment.authorNickname
          } : undefined)
        }
        
        setComments(prev => prev.map(comment => {
          if (comment.id === replyToCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), normalizedReply]
            }
          }
          return comment
        }))
        
        // 답글 작성 후 부모 댓글로 스크롤 이동
        setTimeout(() => {
          const parentCommentElement = document.querySelector(`[data-comment-id="${replyToCommentId}"]`)
          if (parentCommentElement) {
            parentCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 200)
      } else {
        // 일반 댓글인 경우: 목록 끝에 추가 (최신 댓글이므로)
        setComments(prev => [...prev, newComment])
        setTotalComments(totalComments + 1)
        
        // 스크롤을 맨 아래로 이동
        setTimeout(() => {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current.get(openMenuId)
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null)
        }
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openMenuId])

  // 초기 데이터 로딩
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    if (postId) {
      fetchPost()
      fetchComments() // 최초 진입시 beforeId 없이 호출
    }
  }, [postId, isAuthenticated, router, fetchComments])

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
      market: 'ZIP 마켓'
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

  const handlePreviousImage = () => {
    if (!post?.imageUrls || selectedImageIndex === null) return
    setSelectedImageIndex(
      selectedImageIndex > 0 ? selectedImageIndex - 1 : post.imageUrls.length - 1
    )
  }

  const handleNextImage = () => {
    if (!post?.imageUrls || selectedImageIndex === null) return
    setSelectedImageIndex(
      selectedImageIndex < post.imageUrls.length - 1 ? selectedImageIndex + 1 : 0
    )
  }

  const handleSwipe = () => {
    if (!post?.imageUrls || selectedImageIndex === null) return
    
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        handleNextImage()
      } else {
        // Swipe right - previous image
        handlePreviousImage()
      }
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-text-secondary">로딩 중...</p>
      </div>
    )
  }

  if (!post || !post.boardType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-text-secondary">게시글을 찾을 수 없습니다</p>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    )
  }

  const tag = getBoardTypeCommunityTag(post.boardType)
  const Icon = TAG_ICONS[tag]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="touch-area">
            <ArrowLeft className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">ZIPPER</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Card className="rounded-none border-x-0">
          <CardContent className="p-4">
            {/* Tag */}
            <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-gray-50 mb-3">
              {Icon && <Icon className={cn("w-2.5 h-2.5", getTagClass(post.boardType))} strokeWidth={1.5} />}
              <span className="text-gray-400">
                {getBoardTypeLabel(post.boardType)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {post.title}
            </h2>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
                <span className="text-sm text-text-secondary" >
                  {post.author?.nickname || '익명'}
                </span>
              </div>
              <span className="text-sm text-text-tertiary">
                {getTimeAgo(post.createdAt)}
              </span>
            </div>

            <Divider />

            {/* Content */}
            <div className="my-4 text-text-primary whitespace-pre-wrap">
              {post.content}
            </div>

            <Divider />

            {/* Images Section */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="my-4">
                <div 
                  className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={imageUrl}
                        alt={`이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {post.imageUrls.length > 3 && (
                    <div
                      onClick={() => setSelectedImageIndex(3)}
                      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <span className="text-white font-semibold text-sm">+{post.imageUrls.length - 3}</span>
                      </div>
                      <img
                        src={post.imageUrls[3]}
                        alt={`이미지 4`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <Divider />

            {/* Engagement Section */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-text-tertiary">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-text-tertiary">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>{post.commentCount}</span>
                </div>
              </div>
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors",
                  isLiked ? "text-primary" : "text-text-tertiary"
                )}
              >
                <HomeIcon className="w-4 h-4" strokeWidth={1.5} />
                <span>{post.likeCount}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-2 pb-40">
          <div className="bg-surface px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              댓글 {totalComments || comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
            </h3>
          </div>

          {comments.length === 0 ? (
            <Card className="rounded-none border-x-0">
              <CardContent className="p-8 text-center text-text-secondary">
                첫 댓글을 남겨보세요!
              </CardContent>
            </Card>
          ) : (
            <div className="divide-y divide-border">
              {/* 이전 댓글 더보기 버튼 */}
              {hasMoreComments && (
                <div className="flex justify-center py-4 bg-surface border-b border-border">
                  <button
                    onClick={loadOlderComments}
                    disabled={loadingMoreComments}
                    className="text-sm text-primary hover:text-primary/80 disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMoreComments ? '로딩 중...' : '이전 댓글 더보기'}
                  </button>
                </div>
              )}
              
              {comments.map((comment) => (
                <div key={comment.id} data-comment-id={comment.id}>
                  {/* 부모 댓글 */}
                  <div className="bg-surface px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 relative">
                          <span className="text-sm font-medium" style={{ color: '#35373a' }}>
                            {comment.author?.nickname || comment.authorNickname || '익명'}
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                          <div className="ml-auto relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(openMenuId === `comment-${comment.id}` ? null : `comment-${comment.id}`)
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical 
                                className={cn(
                                  "w-4 h-4 transition-colors",
                                  openMenuId === `comment-${comment.id}` ? "text-primary" : "text-gray-600"
                                )} 
                                strokeWidth={1.5} 
                              />
                            </button>
                            {openMenuId === `comment-${comment.id}` && (
                              <div
                                ref={(el) => {
                                  if (el) {
                                    menuRefs.current.set(`comment-${comment.id}`, el)
                                  } else {
                                    menuRefs.current.delete(`comment-${comment.id}`)
                                  }
                                }}
                                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]"
                              >
                                {user && (Number(user.id) === comment.author?.id || Number(user.id) === comment.authorId) ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        // 수정하기 로직
                                        setOpenMenuId(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                                      수정하기
                                    </button>
                                    <button
                                      onClick={() => {
                                        // 삭제하기 로직
                                        setOpenMenuId(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                      삭제하기
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      // 신고하기 로직
                                      setOpenMenuId(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Flag className="w-4 h-4" strokeWidth={1.5} />
                                    신고하기
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-text-primary whitespace-pre-wrap">
                          {renderCommentContent(comment.content)}
                        </p>
                        <button
                          onClick={() => {
                            setReplyTo(comment.author?.nickname || '익명')
                            setReplyToCommentId(comment.id)
                            setCommentText('')
                          }}
                          className="text-xs text-text-tertiary hover:text-primary mt-2 transition-colors"
                        >
                          답글달기
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 답글들 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="relative">
                      {comment.replies.map((reply) => (
                        <div 
                          key={`reply-${comment.id}-${reply.id}`} 
                          className="relative"
                          data-reply-id={reply.id}
                        >
                          {/* ㄴ자 모양 선 */}
                          <div className="absolute left-4 top-0 w-4 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg z-5" />
                          
                          <div className="pl-12 pr-4 py-3 bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-3 h-3 text-text-tertiary" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 relative">
                                  <span className="text-sm font-medium" style={{ color: '#35373a' }}>
                                    {reply.author?.nickname || reply.authorNickname || '익명'}
                                  </span>
                                  <span className="text-xs text-text-tertiary">
                                    {getTimeAgo(reply.createdAt)}
                                  </span>
                                  {/* 답글의 햄버거 메뉴는 부모 댓글과 같은 위치에 */}
                                  <div className="ml-auto relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenMenuId(openMenuId === `reply-${reply.id}` ? null : `reply-${reply.id}`)
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                      <MoreVertical 
                                        className={cn(
                                          "w-4 h-4 transition-colors",
                                          openMenuId === `reply-${reply.id}` ? "text-primary" : "text-gray-600"
                                        )} 
                                        strokeWidth={1.5} 
                                      />
                                    </button>
                                    {openMenuId === `reply-${reply.id}` && (
                                      <div
                                        ref={(el) => {
                                          if (el) {
                                            menuRefs.current.set(`reply-${reply.id}`, el)
                                          } else {
                                            menuRefs.current.delete(`reply-${reply.id}`)
                                          }
                                        }}
                                        className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]"
                                      >
                                        {user && (Number(user.id) === reply.author?.id || Number(user.id) === reply.authorId) ? (
                                          <>
                                            <button
                                              onClick={() => {
                                                // 수정하기 로직
                                                setOpenMenuId(null)
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              <Pencil className="w-4 h-4" strokeWidth={1.5} />
                                              수정하기
                                            </button>
                                            <button
                                              onClick={() => {
                                                // 삭제하기 로직
                                                setOpenMenuId(null)
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                              삭제하기
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              // 신고하기 로직
                                              setOpenMenuId(null)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                          >
                                            <Flag className="w-4 h-4" strokeWidth={1.5} />
                                            신고하기
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-text-primary whitespace-pre-wrap">
                                  {renderCommentContent(reply.content)}
                                </p>
                                <button
                                  onClick={() => {
                                    // 원 댓글(부모 댓글)에 답글을 달되, @답글작성자 형태로 표시
                                    setReplyTo(reply.author?.nickname || '익명')
                                    setReplyToCommentId(comment.id) // 부모 댓글 ID 사용
                                    setCommentText('')
                                  }}
                                  className="text-xs text-text-tertiary hover:text-primary mt-2 transition-colors"
                                >
                                  답글달기
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-screen-sm mx-auto">
          {/* Reply To Indicator */}
          {replyTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-border">
              <span className="text-xs text-text-secondary">
                <span className="font-medium text-primary">@{replyTo}</span>님에게 답글 작성 중
              </span>
              <button
                onClick={() => {
                  setReplyTo(null)
                  setReplyToCommentId(null)
                  setCommentText('')
                }}
                className="text-xs text-text-tertiary hover:text-text-primary"
              >
                취소
              </button>
            </div>
          )}
          
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => {
                const newValue = e.target.value
                
                // 최대 200자 제한
                if (newValue.length > 200) {
                  return
                }
                
                setCommentText(newValue)
              }}
              placeholder="댓글을 입력하세요"
              className="flex-1 px-3 py-2 text-sm leading-5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-text-primary resize-none scrollbar-hide"
              style={{ 
                height: '36px',
                maxHeight: '76px', // 3줄 높이
                overflowY: 'auto',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none' // IE/Edge
              }}
              rows={1}
              disabled={submitting}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = '36px'
                const scrollHeight = target.scrollHeight
                if (scrollHeight <= 76) {
                  target.style.height = scrollHeight + 'px'
                } else {
                  target.style.height = '76px'
                }
              }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentText.trim() || submitting}
              className="!h-[36px] !w-[36px] !min-h-[36px] !min-w-[36px] p-0 flex-shrink-0"
              style={{
                backgroundImage: 'linear-gradient(to right top, #45b393, #44b892, #44be91, #45c38f, #47c88d, #54cc87, #61d081, #6ed37a, #85d56f, #9bd766, #b0d85d, #c5d856)'
               }}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </form>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {selectedImageIndex !== null && post.imageUrls && (
        <div 
          ref={imageViewerRef}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            setTouchEndX(e.changedTouches[0].clientX)
            handleSwipe()
          }}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
          
          {post.imageUrls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePreviousImage()
                }}
                className="absolute left-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNextImage()
                }}
                className="absolute right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" strokeWidth={2} />
              </button>
            </>
          )}
          
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={post.imageUrls[selectedImageIndex]}
              alt={`이미지 ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {post.imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {post.imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === selectedImageIndex ? "bg-white w-6" : "bg-white/50 w-2"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Bottom Sheet */}
      <BottomSheet open={showVerificationSheet} onOpenChange={setShowVerificationSheet}>
        <BottomSheetContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-text-secondary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              건물 인증이 필요해요
            </h3>
            <p className="text-sm text-text-secondary">
              게시글을 보려면 건물 인증을 완료해주세요
            </p>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => {
                setShowVerificationSheet(false)
                router.push('/auth/verify-building')
              }}
              style={{
                backgroundImage: 'linear-gradient(to right top, #45b393, #44b892, #44be91, #45c38f, #47c88d, #54cc87, #61d081, #6ed37a, #85d56f, #9bd766, #b0d85d, #c5d856)'
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              건물 인증하기
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowVerificationSheet(false)
                router.back()
              }}
            >
              나중에 하기
            </Button>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  )
}

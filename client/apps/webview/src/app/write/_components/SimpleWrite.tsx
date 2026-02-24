'use client'

import { useRef, useState } from 'react'
import { Card, CardContent } from '@ui/index'
import { CommunityTag, TAG_LABELS } from '@zipper/models/src/community'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { boardTypeByTag } from '../_constants'
import { WriteScaffold } from './WriteScaffold'

type Props = {
  tag: CommunityTag
  buildingId: number | null
  onBack: () => void
}

export function SimpleWrite({ tag, buildingId, onBack }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!buildingId) {
      toast.error('건물 정보를 불러올 수 없습니다.', { action: { label: '확인', onClick: () => {} } })
      return
    }

    if (!title.trim()) {
      toast.error('제목을 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      titleInputRef.current?.focus()
      return
    }

    if (title.trim().length < 2) {
      toast.error('제목은 2자 이상 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      titleInputRef.current?.focus()
      return
    }

    if (title.length > 200) {
      toast.error('제목은 200자 이내로 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      titleInputRef.current?.focus()
      return
    }

    if (!content.trim()) {
      toast.error('내용을 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      contentTextareaRef.current?.focus()
      return
    }

    if (content.trim().length < 10) {
      toast.error('내용은 10자 이상 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      contentTextareaRef.current?.focus()
      return
    }

    if (content.length > 800) {
      toast.error('내용은 800자 이내로 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      contentTextareaRef.current?.focus()
      return
    }

    try {
      setIsSubmitting(true)

      const { apiClient } = await import('@/lib/api-client')
      const result = await apiClient.createPost({
        buildingId,
        boardType: boardTypeByTag[tag],
        title,
        content,
        imageUrls: [],
      })

      router.push(`/community/${result.id}`)
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error('글 작성에 실패했습니다. 다시 시도해주세요.', { action: { label: '확인', onClick: () => {} } })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WriteScaffold
      title={TAG_LABELS[tag]}
      onBack={onBack}
      actionLabel={isSubmitting ? '작성 중...' : '완료'}
      onAction={handleSubmit}
      actionDisabled={isSubmitting}
    >
      <main className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">제목</label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">내용</label>
              <textarea
                ref={contentTextareaRef}
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </WriteScaffold>
  )
}


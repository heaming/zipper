'use client'

import { useRef, useState } from 'react'
import { Card, CardContent } from '@ui/index'
import { CommunityTag, TAG_LABELS } from '@zipper/models/src/community'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

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
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('사진은 최대 5개까지 첨부할 수 있습니다.', {
        action: { label: '확인', onClick: () => {} },
      })
      return
    }

    const newImages: string[] = []
    const newFiles: File[] = []

    for (let i = 0; i < files.length && images.length + newImages.length < 5; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        newImages.push(dataUrl)
        newFiles.push(file)
      }
    }

    setImages([...images, ...newImages])
    setImageFiles([...imageFiles, ...newFiles])

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

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

      // NOTE: 이미지 업로드는 아직 서버 API가 없어서 빈 배열 유지(기존 동작 유지)
      const imageUrls: string[] = []

      const { apiClient } = await import('@/lib/api-client')
      const result = await apiClient.createPost({
        buildingId,
        boardType: boardTypeByTag[tag],
        title,
        content,
        imageUrls,
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

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                사진 첨부 <span className="text-text-tertiary text-xs">({images.length}/5)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {images.map((image, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-text-tertiary hover:border-primary transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </WriteScaffold>
  )
}


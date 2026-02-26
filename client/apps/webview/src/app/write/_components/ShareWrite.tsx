'use client'

import React, { useRef, useState } from 'react'
import { Card, CardContent } from '@ui/index'
import { CommunityTag, TAG_LABELS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { Plus, X, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { boardTypeByTag } from '../_constants'
import { WriteScaffold } from './WriteScaffold'

type Props = {
  buildingId: number | null
  onBack: () => void
}

export function ShareWrite({ buildingId, onBack }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [itemName, setItemName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titleError, setTitleError] = useState('')
  const [itemNameError, setItemNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  const titleInputRef = useRef<HTMLInputElement>(null)
  const itemNameInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

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
      setTitleError('제목은 2자 이상 입력해주세요.')
      titleInputRef.current?.focus()
      return
    }

    if (title.length > 200) {
      toast.error('제목은 200자 이내로 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      titleInputRef.current?.focus()
      return
    }

    if (!itemName.trim()) {
      toast.error('나눔 물건을 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      itemNameInputRef.current?.focus()
      return
    }

    if (itemName.trim().length < 2) {
      toast.error('나눔 물건은 2자 이상 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      setItemNameError('나눔 물건은 2자 이상 입력해주세요.')
      itemNameInputRef.current?.focus()
      return
    }

    if (itemName.length > 200) {
      toast.error('나눔 물건은 200자 이내로 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      itemNameInputRef.current?.focus()
      return
    }

    if (!description.trim()) {
      toast.error('상세 설명을 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      descriptionTextareaRef.current?.focus()
      return
    }

    if (description.trim().length < 10) {
      toast.error('상세 설명은 10자 이상 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      setDescriptionError('상세 설명은 10자 이상 입력해주세요.')
      descriptionTextareaRef.current?.focus()
      return
    }

    if (description.length > 800) {
      toast.error('상세 설명은 800자 이내로 입력해주세요.', { action: { label: '확인', onClick: () => {} } })
      descriptionTextareaRef.current?.focus()
      return
    }

    try {
      setIsSubmitting(true)

      // 이미지 업로드
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        try {
          console.log('[ShareWrite] Uploading images:', imageFiles.length)
          const uploadResult = await apiClient.uploadImages(imageFiles)
          console.log('[ShareWrite] Upload result:', uploadResult)
          imageUrls = uploadResult.imageUrls
        } catch (uploadError) {
          console.error('[ShareWrite] Image upload failed:', uploadError)
          toast.error('이미지 업로드에 실패했습니다. 다시 시도해주세요.', { action: { label: '확인', onClick: () => {} } })
          setIsSubmitting(false)
          return
        }
      }

      const result = await apiClient.createPost({
        boardType: boardTypeByTag[CommunityTag.SHARE],
        title,
        content: description,
        imageUrls,
        meta: {
          locationDetail: location.trim() || undefined,
          extraData: {
            itemName: itemName.trim() || undefined,
          },
        },
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
      title={TAG_LABELS[CommunityTag.SHARE]}
      onBack={onBack}
      actionLabel={isSubmitting ? '작성 중...' : '완료'}
      onAction={handleSubmit}
      actionDisabled={isSubmitting}
    >
      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                제목 <span className="text-text-tertiary text-xs">({title.length}/200)</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setTitle(e.target.value)
                    if (e.target.value.trim().length > 0 && e.target.value.trim().length < 2) {
                      setTitleError('제목은 2자 이상 입력해주세요.')
                    } else {
                      setTitleError('')
                    }
                  }
                }}
                onBlur={() => {
                  if (title.trim().length > 0 && title.trim().length < 2) {
                    setTitleError('제목은 2자 이상 입력해주세요.')
                  } else {
                    setTitleError('')
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  titleError ? 'border-primary focus:ring-primary' : 'border-border focus:ring-primary'
                )}
              />
              {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">나눔 물건</label>
              <input
                ref={itemNameInputRef}
                type="text"
                placeholder="나눔하실 물건의 이름을 적어주세요"
                value={itemName}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setItemName(e.target.value)
                    if (e.target.value.trim().length > 0 && e.target.value.trim().length < 2) {
                      setItemNameError('나눔 물건은 2자 이상 입력해주세요.')
                    } else {
                      setItemNameError('')
                    }
                  }
                }}
                onBlur={() => {
                  if (itemName.trim().length > 0 && itemName.trim().length < 2) {
                    setItemNameError('나눔 물건은 2자 이상 입력해주세요.')
                  } else {
                    setItemNameError('')
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  itemNameError ? 'border-primary focus:ring-primary' : 'border-border focus:ring-primary'
                )}
              />
              {itemNameError && <p className="text-xs text-red-500 mt-1">{itemNameError}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">희망 장소</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="물건을 가져가실 장소를 적어주세요"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                상세 설명 <span className="text-text-tertiary text-xs">({description.length}/800)</span>
              </label>
              <textarea
                ref={descriptionTextareaRef}
                rows={5}
                placeholder="상세한 내용을 적어주세요"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 800) {
                    setDescription(e.target.value)
                    if (e.target.value.trim().length > 0 && e.target.value.trim().length < 10) {
                      setDescriptionError('상세 설명은 10자 이상 입력해주세요.')
                    } else {
                      setDescriptionError('')
                    }
                  }
                }}
                onBlur={() => {
                  if (description.trim().length > 0 && description.trim().length < 10) {
                    setDescriptionError('상세 설명은 10자 이상 입력해주세요.')
                  } else {
                    setDescriptionError('')
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none',
                  descriptionError ? 'border-primary focus:ring-primary' : 'border-border focus:ring-primary'
                )}
              />
              {descriptionError && <p className="text-xs text-red-500 mt-1">{descriptionError}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                사진 첨부 <span className="text-text-tertiary text-xs">({images.length}/5)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {images.map((image, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={image} alt={`첨부 이미지 ${index + 1}`} className="w-full h-full object-cover" />
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

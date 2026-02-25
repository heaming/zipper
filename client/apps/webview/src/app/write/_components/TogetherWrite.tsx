'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Card,
  CardContent,
  Calendar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/index'
import { CommunityTag, TAG_LABELS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { Plus, X, Calendar as CalendarIcon, Moon, Sun } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { boardTypeByTag } from '../_constants'
import { WriteScaffold } from './WriteScaffold'

type Props = {
  buildingId: number | null
  onBack: () => void
}

export function TogetherWrite({ buildingId, onBack }: Props) {
  const router = useRouter()

  const [category, setCategory] = useState<'공구' | '배달'>('배달')
  const [title, setTitle] = useState('')
  const [targetQuantity, setTargetQuantity] = useState('')
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)
  const [deadlineTime, setDeadlineTime] = useState('')
  const [isPM, setIsPM] = useState(false)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titleError, setTitleError] = useState('')
  const [targetQuantityError, setTargetQuantityError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  const titleInputRef = useRef<HTMLInputElement>(null)
  const targetQuantityInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const now = new Date()
    let defaultDate: Date
    let defaultTime: string

    if (category === '공구') {
      defaultDate = new Date(now)
      defaultDate.setDate(defaultDate.getDate() + 1)
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      defaultTime = `${hours}:${minutes}`
    } else {
      defaultDate = new Date(now)
      const nextHour = now.getHours() + 1
      const hours = String(nextHour).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      defaultTime = `${hours}:${minutes}`
    }

    setDeadlineDate(defaultDate)
    setDeadlineTime(defaultTime)

    const defaultHours = category === '공구' ? now.getHours() : (now.getHours() + 1) % 24
    setIsPM(defaultHours >= 12)
  }, [category])

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

    if (!targetQuantity.trim()) {
      toast.error(`${category === '배달' ? '목표 인원' : '목표 수량'}을 입력해주세요.`, {
        action: { label: '확인', onClick: () => {} },
      })
      targetQuantityInputRef.current?.focus()
      return
    }

    const targetQuantityNum = parseInt(targetQuantity, 10)
    if (isNaN(targetQuantityNum) || targetQuantityNum < 2) {
      toast.error(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`, {
        action: { label: '확인', onClick: () => {} },
      })
      setTargetQuantityError(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`)
      targetQuantityInputRef.current?.focus()
      return
    }

    if (!deadlineDate) {
      toast.error('마감일을 선택해주세요.', { action: { label: '확인', onClick: () => {} } })
      return
    }

    if (!deadlineTime.trim()) {
      toast.error('마감 시간을 선택해주세요.', { action: { label: '확인', onClick: () => {} } })
      return
    }

    try {
      setIsSubmitting(true)

      // 이미지 업로드
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        try {
          console.log('[TogetherWrite] Uploading images:', imageFiles.length)
          const uploadResult = await apiClient.uploadImages(imageFiles)
          console.log('[TogetherWrite] Upload result:', uploadResult)
          imageUrls = uploadResult.imageUrls
        } catch (uploadError) {
          console.error('[TogetherWrite] Image upload failed:', uploadError)
          toast.error('이미지 업로드에 실패했습니다. 다시 시도해주세요.', { action: { label: '확인', onClick: () => {} } })
          setIsSubmitting(false)
          return
        }
      }

      const result = await apiClient.createPost({
        boardType: boardTypeByTag[CommunityTag.TOGATHER],
        title,
        content: description,
        imageUrls,
        meta: {
          quantity: targetQuantity ? parseInt(targetQuantity, 10) : undefined,
          deadline: deadlineDate && deadlineTime 
            ? new Date(`${format(deadlineDate, 'yyyy-MM-dd')}T${deadlineTime}:00`).toISOString()
            : undefined,
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
      title={TAG_LABELS[CommunityTag.TOGATHER]}
      onBack={onBack}
      actionLabel={isSubmitting ? '작성 중...' : '완료'}
      onAction={handleSubmit}
      actionDisabled={isSubmitting}
    >
      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">카테고리</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCategory('배달')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm transition-colors',
                    category === '배달' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'
                  )}
                >
                  배달
                </button>
                <button
                  onClick={() => setCategory('공구')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm transition-colors',
                    category === '공구' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'
                  )}
                >
                  공구
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                제목 <span className="text-text-tertiary text-xs">({title.length}/200)</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                placeholder="예) 닭가슴살 공구 하실 분"
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
              <label className="text-sm font-medium text-text-primary mb-2 block">
                {category === '배달' ? '목표 인원' : '목표 수량'}
              </label>
              <input
                ref={targetQuantityInputRef}
                type="number"
                placeholder="5"
                value={targetQuantity}
                onChange={(e) => {
                  setTargetQuantity(e.target.value)
                  const num = parseInt(e.target.value, 10)
                  if (e.target.value.trim() && (isNaN(num) || num < 2)) {
                    setTargetQuantityError(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`)
                  } else {
                    setTargetQuantityError('')
                  }
                }}
                onBlur={() => {
                  const num = parseInt(targetQuantity, 10)
                  if (targetQuantity.trim() && (isNaN(num) || num < 2)) {
                    setTargetQuantityError(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`)
                  } else {
                    setTargetQuantityError('')
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  targetQuantityError ? 'border-primary focus:ring-primary' : 'border-border focus:ring-primary'
                )}
              />
              {targetQuantityError && <p className="text-xs text-red-500 mt-1">{targetQuantityError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4" id="deadline-container">
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">마감일</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-3 py-2 flex items-center justify-between border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
                        !deadlineDate && 'text-text-tertiary'
                      )}
                    >
                      <span>{deadlineDate ? format(deadlineDate, 'yyyy-MM-dd') : '날짜 선택'}</span>
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto w-[330px]" align="start">
                    <Calendar
                      className="bg-white rounded-lg border shadow-lgtext-xs w-full [--cell-size:2rem]"
                      mode="single"
                      selected={deadlineDate}
                      onSelect={(date) => {
                        setDeadlineDate(date)
                        setCalendarOpen(false)
                      }}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                      locale={ko}
                      captionLayout="label"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">마감 시간</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!deadlineTime) {
                        setDeadlineTime('00:00')
                        setIsPM(false)
                        return
                      }
                      const [hours, minutes] = deadlineTime.split(':').map(Number)
                      let newHours: number

                      if (isPM) {
                        newHours = hours - 12
                        if (newHours < 0) newHours = 0
                      } else {
                        newHours = hours + 12
                        if (newHours >= 24) newHours = 23
                      }

                      const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

                      if (deadlineDate) {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const selectedDate = new Date(deadlineDate)
                        selectedDate.setHours(0, 0, 0, 0)

                        if (selectedDate.getTime() === today.getTime()) {
                          const now = new Date()
                          const selectedDateTime = new Date()
                          selectedDateTime.setHours(newHours, minutes, 0, 0)

                          if (selectedDateTime <= now) {
                            toast.error('오늘 날짜인 경우 현재 시간 이후만 선택할 수 있습니다.', {
                              action: { label: '확인', onClick: () => {} },
                            })
                            return
                          }
                        }
                      }

                      setDeadlineTime(newTime)
                      setIsPM(!isPM)
                    }}
                    className="px-2 py-2 bg-primary text-white font-bold transition-colors rounded-sm flex items-center gap-1.5 w-auto"
                  >
                    {isPM ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>PM</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>AM</span>
                      </>
                    )}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="w-full px-2 py-2 bg-white border border-border rounded font-medium text-center focus:outline-none text-sm font-medium"
                        >
                          {(() => {
                            if (!deadlineTime) return '12'
                            const [hours] = deadlineTime.split(':').map(Number)
                            let displayHours: number
                            if (isPM) {
                              displayHours = hours === 12 ? 12 : hours - 12
                            } else {
                              displayHours = hours === 0 ? 12 : hours
                            }
                            return String(displayHours).padStart(2, '0')
                          })()}
                        </button>
                      }
                    />
                    <DropdownMenuContent align="center" className="w-auto min-w-[3rem] max-h-48 overflow-y-auto p-1">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                        const hourStr = String(hour).padStart(2, '0')
                        const currentMinutes = deadlineTime ? parseInt(deadlineTime.split(':')[1] || '0', 10) : 0

                        let hour24 = hour
                        if (isPM && hour !== 12) hour24 = hour + 12
                        else if (!isPM && hour === 12) hour24 = 0

                        const newTime = `${String(hour24).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`

                        return (
                          <DropdownMenuItem
                            key={hour}
                            onSelect={() => {
                              if (deadlineDate) {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const selectedDate = new Date(deadlineDate)
                                selectedDate.setHours(0, 0, 0, 0)

                                if (selectedDate.getTime() === today.getTime()) {
                                  const now = new Date()
                                  const selectedDateTime = new Date()
                                  selectedDateTime.setHours(hour24, currentMinutes, 0, 0)

                                  if (selectedDateTime <= now) {
                                    toast.error('오늘 날짜인 경우 현재 시간 이후만 선택할 수 있습니다.', {
                                      action: { label: '확인', onClick: () => {} },
                                    })
                                    return
                                  }
                                }
                              }

                              setDeadlineTime(newTime)
                            }}
                            className={cn(
                              'text-center justify-center w-12 px-2 py-1.5 text-sm',
                              (() => {
                                if (!deadlineTime) return hour === 12
                                const [hours] = deadlineTime.split(':').map(Number)
                                let displayHours: number
                                if (isPM) displayHours = hours === 12 ? 12 : hours - 12
                                else displayHours = hours === 0 ? 12 : hours
                                return displayHours === hour
                              })() && 'bg-primary/20 text-primary font-semibold'
                            )}
                          >
                            {hourStr}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="text-text-primary font-medium">:</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="w-full px-2 py-2 bg-white border border-border rounded font-medium text-center focus:outline-none text-sm font-medium"
                        >
                          {deadlineTime ? deadlineTime.split(':')[1] || '00' : '00'}
                        </button>
                      }
                    />
                    <DropdownMenuContent align="center" className="w-auto min-w-[3rem] max-h-48 overflow-y-auto p-1">
                      {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                        const minuteStr = String(minute).padStart(2, '0')
                        const currentHours = deadlineTime ? parseInt(deadlineTime.split(':')[0] || '0', 10) : 0
                        const newTime = `${String(currentHours).padStart(2, '0')}:${minuteStr}`

                        return (
                          <DropdownMenuItem
                            key={minute}
                            onSelect={() => {
                              if (deadlineDate) {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const selectedDate = new Date(deadlineDate)
                                selectedDate.setHours(0, 0, 0, 0)

                                if (selectedDate.getTime() === today.getTime()) {
                                  const now = new Date()
                                  const selectedDateTime = new Date()
                                  selectedDateTime.setHours(currentHours, minute, 0, 0)

                                  if (selectedDateTime <= now) {
                                    toast.error('오늘 날짜인 경우 현재 시간 이후만 선택할 수 있습니다.', {
                                      action: { label: '확인', onClick: () => {} },
                                    })
                                    return
                                  }
                                }
                              }

                              setDeadlineTime(newTime)
                            }}
                            className={cn(
                              'text-center justify-center w-12 px-2 py-1.5 text-sm',
                              deadlineTime && deadlineTime.split(':')[1] === minuteStr && 'bg-primary/20 text-primary font-semibold'
                            )}
                          >
                            {minuteStr}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

        <p className="text-xs text-text-tertiary text-center">💡 작성 완료 시 자동으로 채팅방이 생성돼요</p>
      </main>
    </WriteScaffold>
  )
}


/**
 * 글쓰기 (+ 버튼 플로우)
 * - 타입 선택 먼저
 * - 선택에 따라 폼이 달라짐
 */

'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, Button, Calendar, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@ui/index'
import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { Plus, X, Calendar as CalendarIcon, Clock, Sun, Moon } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

const writeOptions = [
  { tag: CommunityTag.TOGATHER, description: '공구·음식·배달 함께해요' },
  { tag: CommunityTag.SHARE, description: '무료로 나눠드려요' },
  { tag: CommunityTag.LIFESTYLE, description: '우리 동네 궁금해요' },
  { tag: CommunityTag.CHAT, description: '자유롭게 이야기해요' },
  { tag: CommunityTag.MARKET, description: '상업 광고 (권한 필요)' },
]

function WritePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag')
  const [selectedType, setSelectedType] = useState<CommunityTag | null>(
    tagParam ? (tagParam as CommunityTag) : null
  )
  const [buildingId, setBuildingId] = useState<number | null>(null)
  
  // 같이사요 폼 상태
  const [category, setCategory] = useState<'공구' | '배달'>('배달')
  const [title, setTitle] = useState('')
  const [targetQuantity, setTargetQuantity] = useState('')
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)
  const [deadlineTime, setDeadlineTime] = useState('')
  const [isPM, setIsPM] = useState(false) // 오전(false) / 오후(true)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 유효성 검사 에러 상태
  const [titleError, setTitleError] = useState('')
  const [targetQuantityError, setTargetQuantityError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  
  // input refs for focus
  const titleInputRef = useRef<HTMLInputElement>(null)
  const targetQuantityInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

  // 카테고리별 기본 마감일/시간 설정
  useEffect(() => {
    if (selectedType === CommunityTag.TOGATHER) {
      const now = new Date()
      let defaultDate: Date
      let defaultTime: string

      if (category === '공구') {
        // 공구: 현재 시간으로부터 1일 후, 같은 시각
        defaultDate = new Date(now)
        defaultDate.setDate(defaultDate.getDate() + 1)
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        defaultTime = `${hours}:${minutes}`
      } else {
        // 배달: 같은 일자 1시간 뒤
        defaultDate = new Date(now)
        const nextHour = now.getHours() + 1
        const hours = String(nextHour).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        defaultTime = `${hours}:${minutes}`
      }

      setDeadlineDate(defaultDate)
      setDeadlineTime(defaultTime)
      
      // 오전/오후 설정
      const defaultHours = category === '공구' ? now.getHours() : (now.getHours() + 1) % 24
      setIsPM(defaultHours >= 12)
    }
  }, [category, selectedType])

  useEffect(() => {
    if (tagParam) {
      setSelectedType(tagParam as CommunityTag)
    }
  }, [tagParam])

  // buildingId 가져오기
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await apiClient.getProfile()
        if (profile.buildings && profile.buildings.length > 0) {
          setBuildingId(parseInt(String(profile.buildings[0].id), 10))
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }
    loadProfile()
  }, [])

  // 뒤로 가기 핸들러 - 커뮤니티 페이지로 직접 이동
  const handleBack = () => {
    if (tagParam) {
      // tag 파라미터가 있으면 커뮤니티 페이지로 직접 이동
      router.push('/community')
    } else {
      router.back()
    }
  }

  if (!selectedType) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="bg-surface border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">글쓰기</h1>
            <button
              onClick={handleBack}
              className="text-text-secondary"
            >
              ✕
            </button>
          </div>
        </header>

        {/* 타입 선택 */}
        <main className="flex-1 p-4">
          <p className="text-sm text-text-secondary mb-4">
            무엇을 하고 싶으신가요?
          </p>

          <div className="space-y-3">
            {writeOptions.map((option) => {
              const Icon = TAG_ICONS[option.tag]
              return (
                <Card
                  key={option.tag}
                  onClick={() => setSelectedType(option.tag)}
                  className="cursor-pointer hover:border-primary transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      )}
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {TAG_LABELS[option.tag]}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // 파일 input 변경 핸들러
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('사진은 최대 5개까지 첨부할 수 있습니다.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
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
    
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  // 게시글 작성 핸들러
  const handleSubmit = async () => {
    // 유효성 검사
    if (!buildingId) {
      toast.error('건물 정보를 불러올 수 없습니다.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      return
    }

    if (!title.trim()) {
      toast.error('제목을 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      titleInputRef.current?.focus()
      return
    }

    if (title.trim().length < 2) {
      toast.error('제목은 2자 이상 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      setTitleError('제목은 2자 이상 입력해주세요.')
      titleInputRef.current?.focus()
      return
    }

    if (title.length > 200) {
      toast.error('제목은 200자 이내로 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      titleInputRef.current?.focus()
      return
    }

    if (!description.trim()) {
      toast.error('상세 설명을 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      descriptionTextareaRef.current?.focus()
      return
    }

    if (description.trim().length < 10) {
      toast.error('상세 설명은 10자 이상 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      setDescriptionError('상세 설명은 10자 이상 입력해주세요.')
      descriptionTextareaRef.current?.focus()
      return
    }

    if (description.length > 800) {
      toast.error('상세 설명은 800자 이내로 입력해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      descriptionTextareaRef.current?.focus()
      return
    }

    if (!targetQuantity.trim()) {
      toast.error(`${category === '배달' ? '목표 인원' : '목표 수량'}을 입력해주세요.`, {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      targetQuantityInputRef.current?.focus()
      return
    }

    const targetQuantityNum = parseInt(targetQuantity, 10)
    if (isNaN(targetQuantityNum) || targetQuantityNum < 2) {
      toast.error(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`, {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      setTargetQuantityError(`${category === '배달' ? '목표 인원' : '목표 수량'}은 2 이상 입력해주세요.`)
      targetQuantityInputRef.current?.focus()
      return
    }

    if (!deadlineDate) {
      toast.error('마감일을 선택해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      return
    }

    if (!deadlineTime.trim()) {
      toast.error('마감 시간을 선택해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
      return
    }

    try {
      setIsSubmitting(true)

      // 이미지 업로드 (실제로는 서버에 업로드해야 함)
      // 여기서는 일단 빈 배열로 전송 (이미지 업로드 API가 별도로 필요할 수 있음)
      const imageUrls: string[] = [] // TODO: 이미지 업로드 후 URL 배열

      const postData = {
        buildingId,
        boardType: 'togather',
        title,
        content: description,
        imageUrls,
      }

      const result = await apiClient.createPost(postData)
      
      // 작성 완료 후 상세보기 페이지로 이동
      router.push(`/community/${result.id}`)
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error('글 작성에 실패했습니다. 다시 시도해주세요.', {
        action: {
          label: '확인',
          onClick: () => {},
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 같이 사요 전용 폼
  if (selectedType === CommunityTag.TOGATHER) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-surface border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-text-secondary"
            >
              ← 뒤로
            </button>
            <h1 className="text-lg font-bold text-text-primary">
              {TAG_LABELS[selectedType]}
            </h1>
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '작성 중...' : '완료'}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 pb-20">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* 카테고리 */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  카테고리
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCategory('배달')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-colors',
                      category === '배달'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary'
                    )}
                  >
                    배달
                  </button>
                  <button
                    onClick={() => setCategory('공구')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-colors',
                      category === '공구'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary'
                    )}
                  >
                    공구
                  </button>
                </div>
              </div>

              {/* 제목 */}
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
                      // 실시간 유효성 검사
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
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                    titleError 
                      ? "border-primary focus:ring-primary" 
                      : "border-border focus:ring-primary"
                  )}
                />
                {titleError && (
                  <p className="text-xs text-red-500 mt-1">{titleError}</p>
                )}
              </div>

              {/* 목표 수량 */}
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
                      // 실시간 유효성 검사
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
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                      targetQuantityError 
                        ? "border-primary focus:ring-primary" 
                        : "border-border focus:ring-primary"
                    )}
                  />
                  {targetQuantityError && (
                    <p className="text-xs text-red-500 mt-1">{targetQuantityError}</p>
                  )}
              </div>

              {/* 마감일 & 마감시간 */}
              <div className="grid grid-cols-2 gap-4" id="deadline-container">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    마감일
                  </label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 flex items-center justify-between border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                          !deadlineDate && "text-text-tertiary"
                        )}
                      >
                        <span>
                          {deadlineDate ? (
                            format(deadlineDate, "yyyy-MM-dd")
                          ) : (
                            "날짜 선택"
                          )}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent  className="p-0 w-auto w-[330px]" align="start">
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
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    마감 시간
                  </label>
                  <div className="flex items-center gap-2">
                    {/* AM/PM 토글 버튼 */}
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
                          // PM -> AM: 12시간 빼기
                          newHours = hours - 12
                          if (newHours < 0) newHours = 0
                        } else {
                          // AM -> PM: 12시간 더하기
                          newHours = hours + 12
                          if (newHours >= 24) newHours = 23
                        }
                        
                        const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                        
                        // 오늘 날짜인 경우 유효성 검사
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
                                action: {
                                  label: '확인',
                                  onClick: () => {},
                                },
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
                    
                    {/* 시간 드롭다운 (시) */}
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
                      <DropdownMenuContent 
                        align="center" 
                        className="w-auto min-w-[3rem] max-h-48 overflow-y-auto p-1"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                          const hourStr = String(hour).padStart(2, '0')
                          const currentMinutes = deadlineTime ? parseInt(deadlineTime.split(':')[1] || '0', 10) : 0
                          
                          // 24시간 형식으로 변환
                          let hour24 = hour
                          if (isPM && hour !== 12) {
                            hour24 = hour + 12
                          } else if (!isPM && hour === 12) {
                            hour24 = 0
                          }
                          
                          const newTime = `${String(hour24).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`
                          
                          return (
                            <DropdownMenuItem
                              key={hour}
                              onSelect={() => {
                                // 오늘 날짜인 경우 유효성 검사
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
                                        action: {
                                          label: '확인',
                                          onClick: () => {},
                                        },
                                      })
                                      return
                                    }
                                  }
                                }
                                
                                setDeadlineTime(newTime)
                              }}
                              className={cn(
                                "text-center justify-center w-12 px-2 py-1.5 text-sm",
                                (() => {
                                  if (!deadlineTime) return hour === 12
                                  const [hours] = deadlineTime.split(':').map(Number)
                                  let displayHours: number
                                  if (isPM) {
                                    displayHours = hours === 12 ? 12 : hours - 12
                                  } else {
                                    displayHours = hours === 0 ? 12 : hours
                                  }
                                  return displayHours === hour
                                })() && "bg-primary/20 text-primary font-semibold"
                              )}
                            >
                              {hourStr}
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <span className="text-text-primary font-medium">:</span>
                    
                    {/* 시간 드롭다운 (분) */}
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
                      <DropdownMenuContent 
                        align="center" 
                        className="w-auto min-w-[3rem] max-h-48 overflow-y-auto p-1"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                          const minuteStr = String(minute).padStart(2, '0')
                          const currentHours = deadlineTime ? parseInt(deadlineTime.split(':')[0] || '0', 10) : 0
                          const newTime = `${String(currentHours).padStart(2, '0')}:${minuteStr}`
                          
                          return (
                            <DropdownMenuItem
                              key={minute}
                              onSelect={() => {
                                // 오늘 날짜인 경우 유효성 검사
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
                                        action: {
                                          label: '확인',
                                          onClick: () => {},
                                        },
                                      })
                                      return
                                    }
                                  }
                                }
                                
                                setDeadlineTime(newTime)
                              }}
                              className={cn(
                                "text-center justify-center w-12 px-2 py-1.5 text-sm",
                                deadlineTime && deadlineTime.split(':')[1] === minuteStr && "bg-primary/20 text-primary font-semibold"
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

              {/* 내용 */}
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
                      // 실시간 유효성 검사
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
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none",
                    descriptionError 
                      ? "border-primary focus:ring-primary" 
                      : "border-border focus:ring-primary"
                  )}
                />
                {descriptionError && (
                  <p className="text-xs text-red-500 mt-1">{descriptionError}</p>
                )}
              </div>

              {/* 사진 첨부 */}
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

          <p className="text-xs text-text-tertiary text-center">
            💡 작성 완료 시 자동으로 채팅방이 생성돼요
          </p>
        </main>
      </div>
    )
  }

  // 일반 폼
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-text-secondary"
          >
            ← 뒤로
          </button>
          <h1 className="text-lg font-bold text-text-primary">
            {TAG_LABELS[selectedType]}
          </h1>
          <Button size="sm">완료</Button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                제목
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                내용
              </label>
              <textarea
                rows={10}
                placeholder="내용을 입력하세요"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  )
}

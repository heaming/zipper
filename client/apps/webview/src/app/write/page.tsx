/**
 * 글쓰기 (+ 버튼 플로우)
 * - 타입 선택 먼저
 * - 선택에 따라 폼이 달라짐
 */

'use client'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, Button } from '@ui/index'
import { CommunityTag, TAG_LABELS, TAG_ICONS } from '@zipper/models/src/community'

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

  useEffect(() => {
    if (tagParam) {
      setSelectedType(tagParam as CommunityTag)
    }
  }, [tagParam])

  if (!selectedType) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-surface border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">글쓰기</h1>
            <button
              onClick={() => router.back()}
              className="text-text-secondary"
            >
              ✕
            </button>
          </div>
        </header>

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

  // 같이 사요 전용 폼
  if (selectedType === CommunityTag.TOGATHER) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-surface border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSelectedType(null)}
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
                  카테고리
                </label>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm">
                    공구
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 text-text-secondary text-sm">
                    음식
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 text-text-secondary text-sm">
                    배달
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  제목
                </label>
                <input
                  type="text"
                  placeholder="예) 닭가슴살 공구 하실 분"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    목표 수량
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    마감 시간
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  상세 설명
                </label>
                <textarea
                  rows={5}
                  placeholder="상세한 내용을 적어주세요"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
            onClick={() => setSelectedType(null)}
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

// Suspense로 감싸서 export
export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-surface border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">글쓰기</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <p className="text-sm text-text-secondary">로딩 중...</p>
        </main>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  )
}

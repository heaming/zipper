/**
 * 글쓰기 (+ 버튼 플로우)
 * - 타입 선택 먼저
 * - 선택에 따라 폼이 달라짐
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CommunityTag } from '@zipper/models/src/community'
import { motion } from 'framer-motion'

import { apiClient } from '@/lib/api-client'
import { WriteTypeSelect } from './_components/WriteTypeSelect'
import { TogetherWrite } from './_components/TogetherWrite'
import { ShareWrite } from './_components/ShareWrite'
import { SimpleWrite } from './_components/SimpleWrite'

function WritePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag')
  const [selectedType, setSelectedType] = useState<CommunityTag | null>(
    tagParam ? (tagParam as CommunityTag) : null
  )
  const [buildingId, setBuildingId] = useState<number | null>(null)

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

  // 페이지 로드 시 스크롤을 맨 위로 초기화
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selectedType])

  if (!selectedType) {
    return (
      <motion.div
        key="write-type-select"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="flex flex-col min-h-screen bg-background"
      >
        <WriteTypeSelect onSelect={setSelectedType} onClose={handleBack} />
      </motion.div>
    )
  }

  if (selectedType === CommunityTag.TOGATHER) {
    return (
      <motion.div
        key="write-together"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="flex flex-col min-h-screen bg-background"
      >
        <TogetherWrite buildingId={buildingId} onBack={handleBack} />
      </motion.div>
    )
  }

  if (selectedType === CommunityTag.SHARE) {
    return (
      <motion.div
        key="write-share"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="flex flex-col min-h-screen bg-background"
      >
        <ShareWrite buildingId={buildingId} onBack={handleBack} />
      </motion.div>
    )
  }

  return (
    <motion.div
      key={`write-simple-${selectedType}`}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="flex flex-col min-h-screen bg-background"
    >
      <SimpleWrite tag={selectedType} buildingId={buildingId} onBack={handleBack} />
    </motion.div>
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

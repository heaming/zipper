/**
 * 회원가입 완료 후 온보딩 화면
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, BottomSheet, BottomSheetContent } from '@ui/index'
import { CheckCircle2, MapPin, Mail, CreditCard } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartVerification = () => {
    setShowVerificationModal(true)
  }

  const handleBrowseOnly = () => {
    router.push('/')
  }

  // GPS 인증 직접 실행
  const handleGpsVerification = async () => {
    if (!user?.buildingId) {
      setError('건물 정보가 없습니다. 회원가입을 다시 진행해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setShowVerificationModal(false)

      // 브라우저 위치 권한 요청
      if (!navigator.geolocation) {
        setError('위치 서비스를 사용할 수 없습니다.')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await apiClient.verifyBuildingByGps({
              buildingId: parseInt(String(user.buildingId)),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })

            if (result.status === 'VERIFIED') {
              // 사용자 정보 업데이트 (building 정보도 함께 가져와서 bname 포함)
              if (user && user.buildingId) {
                try {
                  const building = await apiClient.getBuildingById(parseInt(String(user.buildingId)))
                  setUser({
                    ...user,
                    buildingVerificationStatus: 'VERIFIED',
                    buildingName: building.name,
                    bname: building.bname,
                  })
                } catch (err) {
                  // building 정보를 가져오지 못해도 인증 상태만 업데이트
                  setUser({
                    ...user,
                    buildingVerificationStatus: 'VERIFIED',
                  })
                }
              } else if (user) {
                setUser({
                  ...user,
                  buildingVerificationStatus: 'VERIFIED',
                })
              }
              
              // 성공 시 메인 화면으로 이동
              router.push('/')
            } else {
              setError(`건물 인증에 실패했습니다. 건물로부터 약 ${Math.round((result.distance || 0))}m 떨어져 있습니다. 건물 근처에서 다시 시도해주세요.`)
              setShowVerificationModal(true) // 다시 모달 열기
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : '인증에 실패했습니다.')
            setShowVerificationModal(true) // 다시 모달 열기
          } finally {
            setLoading(false)
          }
        },
        (err) => {
          setError('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
          setLoading(false)
          setShowVerificationModal(true) // 다시 모달 열기
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다.')
      setLoading(false)
    }
  }

  const handleVerificationMethod = async (method: 'GPS' | 'POST_MAIL' | 'ID_CARD') => {
    if (method === 'GPS') {
      await handleGpsVerification()
    } else if (method === 'POST_MAIL') {
      // 우편물 인증 로직 (향후 구현)
      setError('우편물 인증은 향후 구현 예정입니다.')
    } else if (method === 'ID_CARD') {
      // 주민등록증 인증 로직 (향후 구현)
      setError('주민등록증 인증은 향후 구현 예정입니다.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 상단 이모지 및 제목 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              회원가입이 완료되었어요!
            </h1>
          </div>

          {/* 본문 설명 */}
          <div className="bg-surface rounded-2xl p-6 mb-6 border border-border">
            <p className="text-base text-text-primary text-center leading-relaxed">
              우리 건물 이웃들과 안전하게 소통하기 위해
              <br />
              <span className="font-semibold text-[#4ccf89]">건물 인증</span>이 필요해요.
            </p>
          </div>

          {/* 혜택 리스트 */}
          <div className="bg-surface rounded-2xl p-6 mb-6 border border-border">
            <h2 className="text-sm font-semibold text-text-secondary mb-4">
              ✨ 인증하면 가능해지는 것
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                <span className="text-base text-text-primary">글쓰기</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                <span className="text-base text-text-primary">댓글 참여</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                <span className="text-base text-text-primary">같이사요 참여</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                <span className="text-base text-text-primary">ZIP 마켓 이용</span>
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="space-y-3">
            <Button
              onClick={handleStartVerification}
              fullWidth
              className="bg-[#4ccf89] hover:bg-[#45b87a] text-white h-12 text-base font-medium"
            >
              건물 인증하고 시작하기
            </Button>
            <Button
              onClick={handleBrowseOnly}
              variant="ghost"
              fullWidth
              className="text-text-secondary hover:text-text-primary h-12 text-base"
            >
              읽기 전용으로 둘러보기
            </Button>
          </div>
        </div>
      </main>

      {/* 인증 방법 선택 Bottom Sheet */}
      <BottomSheet open={showVerificationModal} onOpenChange={setShowVerificationModal} title="인증 방법 선택">
        <BottomSheetContent className="p-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#4ccf89]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="w-8 h-8 text-[#4ccf89]" />
              </div>
              <p className="text-base text-text-primary font-medium mb-2">위치 확인 중...</p>
              <p className="text-sm text-text-secondary">건물 근처에서 인증을 진행하고 있습니다.</p>
            </div>
          ) : (
            <>
              <p className="text-base text-text-primary mb-6 text-center">
                어떤 방법으로 인증하시겠어요?
              </p>
              
              <div className="space-y-3">
            <button
              onClick={() => handleVerificationMethod('GPS')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#4ccf89]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#4ccf89]" />
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-text-primary">현재 위치로 인증</div>
                <div className="text-sm text-text-secondary mt-1">GPS를 이용한 위치 확인</div>
              </div>
            </button>

            <button
              onClick={() => handleVerificationMethod('POST_MAIL')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#4ccf89]/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#4ccf89]" />
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-text-primary">우편물 사진 업로드</div>
                <div className="text-sm text-text-secondary mt-1">우편물 사진으로 주소 확인</div>
              </div>
            </button>

            <button
              onClick={() => handleVerificationMethod('ID_CARD')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#4ccf89]/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-[#4ccf89]" />
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-text-primary">주민등록증 인증</div>
                <div className="text-sm text-text-secondary mt-1">주민등록증으로 주소 확인</div>
              </div>
            </button>
          </div>
            </>
          )}
        </BottomSheetContent>
      </BottomSheet>
    </div>
  )
}

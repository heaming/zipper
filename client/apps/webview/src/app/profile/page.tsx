/**
 * 내 정보 (마이페이지)
 */
'use client'

import { useState } from 'react'
import { User, FileText, ShoppingBasket, Gift, Bell, Building2, Settings, ChevronRight, MapPin, Mail, CreditCard, CheckCircle2, Home } from 'lucide-react'
import { Card, CardContent, Divider, Button, BottomSheet, BottomSheetContent } from '@ui/index'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function ProfilePage() {
  const { logout, user, setUser } = useAuthStore()
  const router = useRouter()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isVerified = user?.buildingVerificationStatus === 'VERIFIED'
  const verificationText = isVerified ? '인증 완료' : '인증 미완료'
  const dongText = user?.dong ? `${user.dong} ` : ''
  const buildingNameText = user?.buildingName ? `${user.buildingName} · ` : ''

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleStartVerification = () => {
    setShowVerificationModal(true)
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
              // 사용자 정보 업데이트
              if (user) {
                setUser({
                  ...user,
                  buildingVerificationStatus: 'VERIFIED',
                })
              }
              
              // 성공 시 모달 닫기
              setShowVerificationModal(false)
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
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text-primary">내 정보</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* 프로필 카드 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary">{user?.email.split('@')[0] || '사용자'}</h2>
                <div className="mt-1">
                  <p className="text-sm text-text-secondary">
                    {dongText}{buildingNameText}{verificationText}
                  </p>
                  {!isVerified && (
                    <button
                      onClick={handleStartVerification}
                      className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-[#4ccf89] hover:bg-[#45b87a] text-white text-sm font-medium transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      <span>내 집 인증하기</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 활동 내역 */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <MenuItem icon={FileText} label="내가 쓴 글" />
            <Divider />
            <MenuItem icon={ShoppingBasket} label="참여한 같이사요" />
            <Divider />
            <MenuItem icon={Gift} label="나눔 내역" />
          </CardContent>
        </Card>

        {/* 설정 */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <MenuItem icon={Bell} label="알림 설정" />
            <Divider />
            <MenuItem icon={Building2} label="건물 인증 관리" />
            <Divider />
            <MenuItem icon={Settings} label="앱 설정" />
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Button variant="secondary" fullWidth onClick={handleLogout}>
          로그아웃
        </Button>
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
              <div className="bg-surface rounded-2xl p-6 mb-6 border border-border">
                <p className="text-base text-text-primary text-center leading-relaxed mb-4">
                  우리 건물 이웃들과 안전하게 소통하기 위해
                  <br />
                  <span className="font-semibold text-[#4ccf89]">건물 인증</span>이 필요해요.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                    <span className="text-sm text-text-primary">글쓰기</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                    <span className="text-sm text-text-primary">댓글 참여</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                    <span className="text-sm text-text-primary">같이사요 참여</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ccf89] flex-shrink-0" />
                    <span className="text-sm text-text-primary">ZIP 마켓 이용</span>
                  </div>
                </div>
              </div>

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

function MenuItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
        <span className="text-text-primary">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-text-tertiary" strokeWidth={1.5} />
    </button>
  )
}

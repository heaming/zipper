/**
 * 내 정보 (마이페이지)
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, FileText, ShoppingBasket, Gift, Bell, Building2, Settings, ChevronRight, MapPin, Mail, CreditCard, CheckCircle2, Home, Package, Leaf, Flower2, TreeDeciduous, Trees, Key } from 'lucide-react'
import { Card, CardContent, Divider, Button, BottomSheet, BottomSheetContent } from '@ui/index'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

// 레벨 아이콘 매핑
const levelIcons = {
  1: Package,
  2: Leaf,
  3: Flower2,
  4: TreeDeciduous,
  5: Trees,
  6: Key, // ZIPPER 지기
}

// 레벨 설명 매핑
const levelDescriptions: Record<number, string> = {
  1: 'ZIPPER에 새로 입주했어요',
  2: '이웃들과 조심스레 인사를 나누고 있어요',
  3: '이웃들과 활발히 소통하고 있어요',
  4: '우리 마을 소식통이에요',
  5: '우리 마을을 든든하게 지키고 있어요',
  6: '우리 마을을 정성스레 돌보고 있어요.', // ZIPPER 지기
}

export default function ProfilePage() {
  const { logout, user, setUser } = useAuthStore()
  const router = useRouter()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [levelInfo, setLevelInfo] = useState<{
    level: number
    icon: string
    name: string
    color: string
    activityScore: number
    progress: number
    remainingPoints: number
  } | null>(null)

  const isVerified = user?.buildingVerificationStatus === 'VERIFIED'
  const verificationText = isVerified ? '인증 완료' : '인증 미완료'
  const verificationTextClass = isVerified ? 'text-primary' : 'text-[#fd6174]'
  const bnameText = user?.bname ? `${user.bname} ` : ''
  const buildingNameText = user?.buildingName ? `${user.buildingName} · ` : ''

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // building 정보를 가져와서 bname 업데이트
  useEffect(() => {
    const loadBuildingInfo = async () => {
      if (user?.buildingId && !user.bname) {
        try {
          const building = await apiClient.getBuildingById(parseInt(String(user.buildingId)))
          if (user) {
            setUser({
              ...user,
              buildingName: building.name,
              bname: building.bname,
            })
          }
        } catch (err) {
          // building 정보를 가져오지 못해도 무시
          console.error('Failed to load building info:', err)
        }
      }
    }
    
    loadBuildingInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.buildingId, user?.bname])

  // 레벨 정보 로드 (건물 인증 완료된 경우에만)
  useEffect(() => {
    const loadLevelInfo = async () => {
      // 건물 인증이 완료되지 않았으면 레벨 정보를 로드하지 않음
      if (!isVerified || !user) {
        setLevelInfo(null)
        return
      }

      // 토큰이 있는지 확인
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!token) {
        return // 토큰이 없으면 레벨 정보를 로드하지 않음
      }

      try {
        setAuthError('')
        const level = await apiClient.getLevel()
        setLevelInfo({
          level: level.level,
          icon: level.icon,
          name: level.name,
          color: level.color,
          activityScore: level.activityScore,
          progress: level.progress,
          remainingPoints: level.remainingPoints,
        })
      } catch (err) {
        // 인증 오류(401) 처리
        if (err instanceof Error) {
          if (err.message.includes('인증이 만료') || err.message.includes('인증')) {
            setAuthError(err.message)
            // 2초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
              logout()
              router.push('/auth/login')
            }, 2000)
          }
        }
      }
    }
    
    if (user) {
      loadLevelInfo()
    }
  }, [user, isVerified, logout, router])

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

      {/* 인증 오류 팝업 */}
      {authError && (
        <div className="fixed top-16 left-4 right-4 z-50 animate-in slide-in-from-top-5">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm shadow-lg">
            <div className="flex items-center justify-between">
              <span>{authError}</span>
              <button
                onClick={() => {
                  setAuthError('')
                  logout()
                  router.push('/auth/login')
                }}
                className="ml-2 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* 프로필 카드 */}
        <Card>
          <CardContent className="p-6">
            {/* 첫 번째 줄: 프로필 아이콘, 닉네임, 배지 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text-primary truncate">{user?.nickname}</h2>
                  {isVerified && levelInfo && (
                    <div 
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full flex-shrink-0" 
                      style={{ 
                        backgroundColor: levelInfo.level === 6 ? '#8B451315' : `${levelInfo.color}15`
                      }}
                    >
                      {(() => {
                        const IconComponent = levelIcons[levelInfo.level as keyof typeof levelIcons] || Package
                        const displayColor = levelInfo.level === 6 ? '#8B4513' : levelInfo.color // ZIPPER 지기는 갈색
                        return <IconComponent className="w-4 h-4" style={{ color: displayColor }} strokeWidth={2} />
                      })()}
                      <span 
                        className="text-xs font-semibold" 
                        style={{ color: levelInfo.level === 6 ? '#8B4513' : levelInfo.color }}
                      >
                        LV{levelInfo.level}
                      </span>
                    </div>
                  )}
                </div>
                {/* 이름/레벨 바로 아래: 건물 내용 및 인증 여부 */}
                <div className="mt-1">
                  <p className="text-sm text-text-secondary">
                    {bnameText}{buildingNameText}<span className={verificationTextClass}>{verificationText}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 인증 미완료 시 인증하기 버튼 */}
            {!isVerified && (
              <div className="mt-3">
                <button
                  onClick={handleStartVerification}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4ccf89] hover:bg-[#45b87a] text-white text-sm font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>내 집 인증하기</span>
                </button>
              </div>
            )}

            {/* 인증 완료 시 레벨 정보 및 진행바 */}
            {isVerified && levelInfo && (() => {
              const displayColor = levelInfo.level === 6 ? '#8B4513' : levelInfo.color;
              const IconComponent = levelIcons[levelInfo.level as keyof typeof levelIcons] || Package;

              return (
                <>
                  <Divider className="my-4" />
                  <div className="space-y-3">
                    {/* 아이콘 + 레벨 이름 + 레벨 설명 */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <IconComponent className="w-5 h-5" style={{ color: displayColor }} strokeWidth={2} />
                        <span 
                          className="text-sm font-medium" 
                          style={{ color: displayColor }}
                        >
                          {levelInfo.name}
                        </span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {levelDescriptions[levelInfo.level] || ''}
                      </span>
                    </div>

                    {/* 진행바 */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${levelInfo.progress}%`,
                            backgroundColor: displayColor,
                          }}
                        />
                      </div>
                      
                      {/* 다음 단계까지 남은 점수 및 진행률 */}
                      <div className="flex items-center justify-between">
                        {levelInfo.level < 5 ? (
                          <span className="text-xs text-text-tertiary">
                            다음 단계까지 {levelInfo.remainingPoints}점 남았어요
                          </span>
                        ) : levelInfo.level === 6 ? (
                          <span className="text-xs text-text-tertiary">
                            ZIPPER 지기
                          </span>
                        ) : (
                          <span className="text-xs text-text-tertiary">
                            최고 레벨이에요!
                          </span>
                        )}
                        <span className="text-xs text-text-tertiary">
                          {levelInfo.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* 활동 내역 */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <Link href="/profile/activity">
              <MenuItem icon={FileText} label="내 활동 내역" />
            </Link>
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

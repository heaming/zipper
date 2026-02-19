/**
 * 건물 인증 페이지
 * 회원가입 후 또는 나중에 인증할 수 있음
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, BottomSheet, BottomSheetContent } from '@ui/index'
import { apiClient } from '@/lib/api-client'
import { MapPin, Camera, Mail, CreditCard, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

type VerificationType = 'GPS' | 'POST_MAIL' | 'ID_CARD' | null

export default function VerifyBuildingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const method = searchParams.get('method') as VerificationType
  const buildingId = searchParams.get('buildingId')
  const userId = searchParams.get('userId')
  const { user, setUser } = useAuthStore()

  const [selectedType, setSelectedType] = useState<VerificationType>(null)
  const [showTypeSheet, setShowTypeSheet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // GPS 인증
  const handleGpsVerification = async () => {
    if (!buildingId) {
      setError('건물 정보가 없습니다.')
      return
    }

    try {
      setLoading(true)
      setError('')

      // 브라우저 위치 권한 요청
      if (!navigator.geolocation) {
        setError('위치 서비스를 사용할 수 없습니다.')
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await apiClient.verifyBuildingByGps({
              buildingId: parseInt(buildingId),
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
              
              setSuccess(true)
              setTimeout(() => {
                router.push('/')
              }, 2000)
            } else {
              setError(`건물 인증에 실패했습니다. 건물로부터 약 ${Math.round((result.distance || 0))}m 떨어져 있습니다. 건물 근처에서 다시 시도해주세요.`)
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : '인증에 실패했습니다.')
          } finally {
            setLoading(false)
          }
        },
        (err) => {
          setError('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
          setLoading(false)
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

  // method 파라미터가 있으면 자동으로 해당 인증 실행
  useEffect(() => {
    if (method === 'GPS' && buildingId && !loading && !success) {
      handleGpsVerification()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, buildingId])

  // 우편물 인증
  const handlePostMailVerification = () => {
    setError('우편물 인증은 향후 구현 예정입니다.')
    // TODO: 사진 업로드 구현
  }

  // 주민등록증 인증
  const handleIdCardVerification = () => {
    setError('주민등록증 인증은 향후 구현 예정입니다.')
    // TODO: 주민등록증 업로드 및 OCR 구현
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">인증 완료!</h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          건물 인증이 완료되었습니다.
          <br />
          이제 커뮤니티를 이용하실 수 있습니다.
        </p>
        <Button
          onClick={() => router.push('/')}
          style={{
            backgroundImage: 'linear-gradient(to right top, #45b393, #44b892, #44be91, #45c38f, #47c88d, #54cc87, #61d081, #6ed37a, #85d56f, #9bd766, #b0d85d, #c5d856)'
          }}
        >
          시작하기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="text-text-primary">
            ← 뒤로
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto pt-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">건물 인증</h1>
          <p className="text-sm text-text-secondary mb-6">
            거주지를 인증하여 커뮤니티에 참여하세요
          </p>

          <Card>
            <CardContent className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loading && method === 'GPS' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#4ccf89]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <MapPin className="w-8 h-8 text-[#4ccf89]" />
                  </div>
                  <p className="text-base text-text-primary font-medium mb-2">위치 확인 중...</p>
                  <p className="text-sm text-text-secondary">건물 근처에서 인증을 진행하고 있습니다.</p>
                </div>
              )}

              {!loading && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-text-primary">인증 방식 선택</h3>
                  
                  {/* GPS 인증 (현재 구현됨) */}
                  <button
                    onClick={handleGpsVerification}
                    disabled={loading}
                    className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-colors text-left flex items-center gap-3 disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">현재 위치로 인증</div>
                      <div className="text-sm text-text-secondary">GPS를 사용하여 건물 근처에서 인증합니다</div>
                    </div>
                  </button>

                {/* 우편물 인증 (향후 구현) */}
                <button
                  onClick={handlePostMailVerification}
                  disabled
                  className="w-full p-4 rounded-lg border-2 border-border opacity-50 text-left flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">우편물 사진으로 인증</div>
                    <div className="text-sm text-text-secondary">향후 구현 예정</div>
                  </div>
                </button>

                {/* 주민등록증 인증 (향후 구현) */}
                <button
                  onClick={handleIdCardVerification}
                  disabled
                  className="w-full p-4 rounded-lg border-2 border-border opacity-50 text-left flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">주민등록증으로 인증</div>
                    <div className="text-sm text-text-secondary">향후 구현 예정</div>
                  </div>
                </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              나중에 하기
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

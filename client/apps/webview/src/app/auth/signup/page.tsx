/**
 * 회원가입 페이지 (단계별: 기본정보 → 인증 → 주소입력)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent } from '@ui/index'
import { apiClient } from '@/lib/api-client'
import { Search, MapPin, Mail, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

type SignupStep = 'basic' | 'verification' | 'address'

// 카카오 우편번호 서비스 타입 선언
declare global {
  interface Window {
    kakao: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string
          roadAddress: string
          jibunAddress: string
          buildingName: string
          bname: string
          apartment: string
        }) => void
        width?: string | number
        height?: string | number
      }) => {
        open: (options?: { q?: string; left?: number; top?: number; popupTitle?: string; popupKey?: string; autoClose?: boolean }) => void
        embed: (element: HTMLElement, options?: { q?: string; autoClose?: boolean }) => void
      }
    }
  }
}

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [step, setStep] = useState<SignupStep>('basic')
  
  // Input refs for focus
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const passwordConfirmRef = useRef<HTMLInputElement>(null)
  const nicknameRef = useRef<HTMLInputElement>(null)
  const phoneNumberRef = useRef<HTMLInputElement>(null)
  
  // 기본 정보
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // 필드별 에러 메시지
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    passwordConfirm?: string
    nickname?: string
    phoneNumber?: string
  }>({})
  
  // 인증 정보 (이메일만)
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']) // 6자리 인증 코드
  const verificationInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  // 주소 정보 (카카오 우편번호 서비스 - 실제 사용되는 필드만)
  const [postcode, setPostcode] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [jibunAddress, setJibunAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [buildingName, setBuildingName] = useState('')
  const [bname, setBname] = useState('')
  const [sido, setSido] = useState('')
  const [sigungu, setSigungu] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 카카오 우편번호 서비스 스크립트 로드
  useEffect(() => {
    // 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.Postcode) {
      return
    }

    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    
    script.onload = () => {
      // 스크립트 로드 완료
    }
    
    script.onerror = () => {
      setError('우편번호 서비스를 불러오는데 실패했습니다.')
    }
    
    document.head.appendChild(script)
    
    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 곳에서도 사용 가능)
    }
  }, [])
  
  // 인증 코드 발송 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
  // 이메일 인증 코드 발송
  const sendVerificationCode = async () => {
    try {
      setError('')
      setLoading(true)
      
      await apiClient.sendEmailVerificationCode({ email })
      
      setCodeSent(true)
      setCountdown(180) // 3분
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 인증 코드 입력 핸들러
  const handleVerificationCodeChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // 다음 입력칸으로 포커스 이동
    if (value && index < 5) {
      verificationInputRefs.current[index + 1]?.focus()
    }

    // 백스페이스 시 이전 입력칸으로 포커스 이동
    if (!value && index > 0) {
      verificationInputRefs.current[index - 1]?.focus()
    }
  }

  // 인증 코드 입력 핸들러 (붙여넣기)
  const handleVerificationCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    const newCode = ['', '', '', '', '', '']
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setVerificationCode(newCode)

    // 마지막 입력된 칸 다음으로 포커스
    const nextIndex = Math.min(pastedData.length, 5)
    verificationInputRefs.current[nextIndex]?.focus()
  }

  // 인증 코드 입력 핸들러 (키보드)
  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      verificationInputRefs.current[index - 1]?.focus()
    }
  }

  // 이메일 인증 코드 확인
  const verifyCode = async () => {
    const code = verificationCode.join('')
    if (!code || code.length !== 6) {
      setError('인증 코드를 모두 입력해주세요.')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      await apiClient.verifyEmailCode({ email, code })
      
      // 인증 성공 시 Redis에 인증 완료 상태 저장 (회원가입 완료 전까지 유지)
      // 인증 완료 상태를 세션에 저장
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('emailVerified', 'true')
        sessionStorage.setItem('verifiedEmail', email)
      }
      
      setIsVerified(true)
      setTimeout(() => {
        setStep('address')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드가 올바르지 않습니다.')
      // 인증 실패 시 입력 초기화
      setVerificationCode(['', '', '', '', '', ''])
      verificationInputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }
  
  // step 변경 시 error 초기화
  useEffect(() => {
    setError('')
    setFieldErrors({})
  }, [step])

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    if (step === 'verification' && typeof window !== 'undefined') {
      const emailVerified = sessionStorage.getItem('emailVerified')
      const verifiedEmail = sessionStorage.getItem('verifiedEmail')
      
      // 이전에 인증했지만 회원가입이 완료되지 않은 경우
      if (emailVerified === 'true' && verifiedEmail === email) {
        setIsVerified(true)
        setCodeSent(true)
      } else {
        // 인증 상태 초기화
        setIsVerified(false)
        setCodeSent(false)
        setVerificationCode(['', '', '', '', '', ''])
        setCountdown(0)
      }
    }
  }, [step, email])

  // 기본 정보 단계 제출
  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // 필수 필드 검증
    const errors: typeof fieldErrors = {}
    let firstErrorField: HTMLInputElement | null = null

    if (!email) {
      errors.email = '이메일을 입력해주세요'
      if (!firstErrorField) firstErrorField = emailRef.current
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요'
      if (!firstErrorField) firstErrorField = emailRef.current
    }

    if (!password) {
      errors.password = '비밀번호를 입력해주세요'
      if (!firstErrorField) firstErrorField = passwordRef.current
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다'
      if (!firstErrorField) firstErrorField = passwordRef.current
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요'
      if (!firstErrorField) firstErrorField = passwordConfirmRef.current
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다'
      if (!firstErrorField) firstErrorField = passwordConfirmRef.current
    }

    if (!nickname) {
      errors.nickname = '닉네임을 입력해주세요'
      if (!firstErrorField) firstErrorField = nicknameRef.current
    } else if (nickname.length < 2 || nickname.length > 10) {
      errors.nickname = '닉네임은 2-10자로 입력해주세요'
      if (!firstErrorField) firstErrorField = nicknameRef.current
    } else if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
      errors.nickname = '닉네임은 한글, 영문, 숫자만 사용 가능합니다'
      if (!firstErrorField) firstErrorField = nicknameRef.current
    }

    if (!phoneNumber) {
      errors.phoneNumber = '휴대폰 번호를 입력해주세요'
      if (!firstErrorField) firstErrorField = phoneNumberRef.current
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phoneNumber.replace(/-/g, ''))) {
      errors.phoneNumber = '올바른 휴대폰 번호 형식을 입력해주세요'
      if (!firstErrorField) firstErrorField = phoneNumberRef.current
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      if (firstErrorField) {
        firstErrorField.focus()
      }
      return
    }

    // 중복 체크
    try {
      setLoading(true)
      
      // 이메일 중복 체크
      const emailCheck = await apiClient.checkEmailExists(email)
      if (emailCheck.exists) {
        errors.email = '이미 가입된 이메일입니다'
        if (!firstErrorField) firstErrorField = emailRef.current
      }

      // 닉네임 중복 체크
      const nicknameCheck = await apiClient.checkNicknameExists(nickname)
      if (nicknameCheck.exists) {
        errors.nickname = '이미 사용 중인 닉네임입니다'
        if (!firstErrorField) firstErrorField = nicknameRef.current
      }

      // 휴대폰 번호 중복 체크
      const phoneCheck = await apiClient.checkPhoneNumberExists(phoneNumber)
      if (phoneCheck.exists) {
        errors.phoneNumber = '이미 사용 중인 휴대폰 번호입니다'
        if (!firstErrorField) firstErrorField = phoneNumberRef.current
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        if (firstErrorField) {
          firstErrorField.focus()
        }
        return
      }

      // 인증 단계로 이동
      setStep('verification')
    } catch (err) {
      setError(err instanceof Error ? err.message : '중복 확인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  // 휴대폰 번호 자동 포맷팅 (하이픈 추가)
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '')
    
    // 최대 11자리까지만 허용
    const limitedNumbers = numbers.slice(0, 11)
    
    // 자동 하이픈 추가
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  // 카카오 우편번호 서비스 실행 (팝업 방식)
  const execDaumPostcode = () => {
    if (!window.kakao) {
      setError('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.kakao.Postcode({
      oncomplete: function(data: {
        zonecode: string
        roadAddress: string
        jibunAddress: string
        buildingName: string
        bname: string
        sido?: string
        sigungu?: string
      }) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
        // 카카오 우편번호 서비스의 실제 사용되는 데이터만 저장
        setPostcode(data.zonecode)
        setRoadAddress(data.roadAddress)
        setJibunAddress(data.jibunAddress)
        setBuildingName(data.buildingName || '')
        setBname(data.bname || '')
        setSido(data.sido || '')
        setSigungu(data.sigungu || '')
        setError('') // 에러 초기화
      },
      width: '100%',
      height: '100%',
    }).open()
  }
  
  // 주소 파싱 함수 (카카오 우편번호 서비스 주소를 파싱)
  const parseAddress = (roadAddress: string, jibunAddress: string) => {
    // 도로명 주소 예: "서울특별시 강남구 테헤란로 123"
    // 지번 주소 예: "서울특별시 강남구 역삼동 123-45"
    
    const address = roadAddress || jibunAddress
    if (!address) return { city: '', district: '', neighborhood: '' }
    
    // 주소를 공백으로 분리
    const parts = address.split(' ')
    
    let city = ''
    let district = ''
    let neighborhood = ''
    
    // 첫 번째 부분이 시/도 (예: "서울특별시", "경기도")
    if (parts.length > 0) {
      city = parts[0]
    }
    
    // 두 번째 부분이 구/시/군 (예: "강남구", "수원시")
    if (parts.length > 1) {
      district = parts[1]
    }
    
    // 세 번째 부분이 동/면/읍 (예: "역삼동", "테헤란로")
    if (parts.length > 2) {
      // "테헤란로" 같은 경우는 도로명이므로, 지번 주소에서 동 정보 추출
      if (jibunAddress) {
        const jibunParts = jibunAddress.split(' ')
        if (jibunParts.length > 2) {
          neighborhood = jibunParts[2].replace(/동$/, '') // "동" 제거
        }
      } else {
        // 도로명 주소만 있는 경우
        neighborhood = parts[2]
      }
    }
    
    return { city, district, neighborhood }
  }

  // 주소 입력 단계 제출
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!postcode || !roadAddress) {
      setError('주소를 검색해주세요.')
      return
    }

    try {
      setLoading(true)
      
      // 건물 검색 시도 (도로명 주소 또는 지번 주소로 검색)
      let buildingId: number
      const searchKeyword = roadAddress || jibunAddress
      
      if (!searchKeyword) {
        setError('주소를 검색해주세요.')
        setLoading(false)
        return
      }

      try {
        const searchResult = await apiClient.searchBuildings(searchKeyword)
        if (searchResult.buildings && searchResult.buildings.length > 0) {
          buildingId = searchResult.buildings[0].id
        } else {
          // 건물이 없으면 새로 생성 (카카오 우편번호 서비스 전체 데이터 전달)
          const newBuildingName = buildingName || roadAddress.split(' ').slice(-1)[0] || '건물'
          
          const newBuilding = await apiClient.createBuilding({
            name: newBuildingName,
            roadAddress: roadAddress,
            jibunAddress: jibunAddress,
            bname: bname,
            sido: sido,
            sigungu: sigungu,
            buildingType: 'APARTMENT', // 기본값, 추후 사용자가 선택할 수 있도록 개선 가능
          })
          
          buildingId = newBuilding.id
        }
      } catch (searchErr) {
        const errorMessage = searchErr instanceof Error ? searchErr.message : '건물 검색에 실패했습니다.'
        setError(errorMessage)
        setLoading(false)
        return
      }

      // 상세 주소에서 동/호수 파싱
      const dongMatch = detailAddress.match(/(\d+동|[\w]+동)/)
      const hoMatch = detailAddress.match(/(\d+호)/)
      const dong = dongMatch ? dongMatch[1] : undefined
      const ho = hoMatch ? hoMatch[1] : undefined

      const result = await apiClient.signup({
        email,
        password,
        nickname,
        phoneNumber,
        buildingId,
        dong,
        ho,
      })
      
      // 회원가입 성공 시 인증 상태 제거
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('emailVerified')
        sessionStorage.removeItem('verifiedEmail')
      }
      
      // 회원가입 후 자동 로그인
      try {
        const loginResponse = await apiClient.login({ email, password })
        // API 응답을 User 타입에 맞게 변환
        const user = {
          ...loginResponse.user,
        }
        login(user, loginResponse.accessToken)
        
        // 온보딩 화면으로 이동
        router.push('/auth/onboarding')
      } catch (loginErr) {
        // 로그인 실패 시에도 온보딩 화면으로 이동 (사용자가 수동으로 로그인 가능)
        router.push('/auth/onboarding')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      setError(errorMessage)
      // 중복 에러인 경우 특정 필드에 에러 표시
      if (errorMessage.includes('이메일')) {
        setFieldErrors({ email: errorMessage })
      } else if (errorMessage.includes('닉네임')) {
        setFieldErrors({ nickname: errorMessage })
      } else if (errorMessage.includes('휴대폰') || errorMessage.includes('전화번호')) {
        setFieldErrors({ phoneNumber: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="flex items-center h-14 px-4">
          {step === 'basic' ? (
            <Link href="/" className="flex items-center gap-1 text-text-primary">
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              <span>뒤로</span>
            </Link>
          ) : step === 'verification' ? (
            <button 
              onClick={() => {
                // 인증 단계에서 뒤로가기 시 인증 상태 초기화
                setError('') // alert 초기화
                setIsVerified(false)
                setCodeSent(false)
                setVerificationCode(['', '', '', '', '', ''])
                setCountdown(0)
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('emailVerified')
                  sessionStorage.removeItem('verifiedEmail')
                }
                setStep('basic')
              }} 
              className="flex items-center gap-1 text-text-primary"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              <span>뒤로</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                // 주소 입력 단계에서 뒤로가기 시 인증 상태 확인 및 alert 초기화
                setError('') // alert 초기화
                if (isVerified) {
                  setStep('verification')
                } else {
                  setStep('basic')
                }
              }} 
              className="flex items-center gap-1 text-text-primary"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              <span>뒤로</span>
            </button>
          )}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${step === 'basic' ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'verification' ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'address' ? 'bg-primary' : 'bg-gray-300'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto pt-8">
          {step === 'basic' && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-2">회원가입</h1>
              <p className="text-sm text-text-secondary mb-6">
                기본 정보를 입력해주세요
              </p>

              <form onSubmit={handleBasicSubmit}>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        이메일
                      </label>
                      <input
                        ref={emailRef}
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (fieldErrors.email) {
                            setFieldErrors({ ...fieldErrors, email: undefined })
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-border'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        비밀번호
                      </label>
                      <input
                        ref={passwordRef}
                        type="password"
                        placeholder="8자 이상 입력하세요"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (fieldErrors.password) {
                            setFieldErrors({ ...fieldErrors, password: undefined })
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-border'
                        }`}
                      />
                      {fieldErrors.password && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        비밀번호 확인
                      </label>
                      <input
                        ref={passwordConfirmRef}
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={passwordConfirm}
                        onChange={(e) => {
                          setPasswordConfirm(e.target.value)
                          if (fieldErrors.passwordConfirm) {
                            setFieldErrors({ ...fieldErrors, passwordConfirm: undefined })
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldErrors.passwordConfirm ? 'border-red-500 focus:ring-red-500' : 'border-border'
                        }`}
                      />
                      {fieldErrors.passwordConfirm && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.passwordConfirm}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        닉네임
                      </label>
                      <input
                        ref={nicknameRef}
                        type="text"
                        placeholder="2-10자, 한글/영문/숫자"
                        value={nickname}
                        onChange={(e) => {
                          setNickname(e.target.value)
                          if (fieldErrors.nickname) {
                            setFieldErrors({ ...fieldErrors, nickname: undefined })
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldErrors.nickname ? 'border-red-500 focus:ring-red-500' : 'border-border'
                        }`}
                      />
                      {fieldErrors.nickname ? (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.nickname}</p>
                      ) : (
                        <p className="text-xs text-text-tertiary mt-1">
                          ⚠️ 닉네임은 변경할 수 없으니 신중하게 작성해주세요
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        휴대폰 번호
                      </label>
                      <input
                        ref={phoneNumberRef}
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phoneNumber}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value)
                          setPhoneNumber(formatted)
                          if (fieldErrors.phoneNumber) {
                            setFieldErrors({ ...fieldErrors, phoneNumber: undefined })
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-border'
                        }`}
                      />
                      {fieldErrors.phoneNumber && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>
                      )}
                    </div>

                <Button type="submit" fullWidth className="mt-6" disabled={loading}>
                  인증하기
                </Button>
                  </CardContent>
                </Card>
              </form>
            </>
          )}

          {step === 'verification' && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-2">이메일 인증</h1>
              <p className="text-sm text-text-secondary mb-6">
                {email}로 인증 코드를 발송했습니다
              </p>

              <Card>
                <CardContent className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {!isVerified ? (
                    <>
                      {/* 인증 코드 발송 */}
                      {!codeSent && (
                        <div className="space-y-4">
                          <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                              <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-text-primary font-medium mb-2">{email}</p>
                            <p className="text-sm text-text-secondary">위 이메일로 인증 코드를 발송하시겠습니까?</p>
                          </div>

                          <Button
                            onClick={sendVerificationCode}
                            fullWidth
                            disabled={loading}
                            className="bg-[#4ccf89] hover:bg-[#45b87a] text-white"
                          >
                            인증 코드 발송
                          </Button>
                        </div>
                      )}

                      {/* 인증 코드 입력 */}
                      {codeSent && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-3 text-center">
                              인증 코드를 입력해주세요
                            </label>
                            <div className="flex justify-center gap-2">
                              {verificationCode.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={(el) => {
                                    verificationInputRefs.current[index] = el
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                                  onPaste={handleVerificationCodePaste}
                                  onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-border"
                                  autoFocus={index === 0}
                                />
                              ))}
                            </div>
                            {countdown > 0 && (
                              <p className="text-xs text-text-tertiary mt-3 text-center">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} 후 재발송 가능
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={verifyCode}
                              fullWidth
                              disabled={loading || verificationCode.join('').length !== 6}
                              className="bg-[#4ccf89] hover:bg-[#45b87a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              인증 확인
                            </Button>
                            {countdown === 0 && (
                              <Button
                                onClick={sendVerificationCode}
                                variant="secondary"
                                disabled={loading}
                              >
                                재발송
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-text-primary font-medium">인증이 완료되었습니다!</p>
                      <p className="text-sm text-text-secondary mt-2">주소 입력 단계로 이동합니다...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {step === 'address' && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-2">주소 입력</h1>
              <p className="text-sm text-text-secondary mb-6">
                거주하시는 주소를 입력해주세요
              </p>

              <form onSubmit={handleAddressSubmit}>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    {/* 우편번호 검색 */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        주소 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="우편번호"
                          value={postcode}
                          readOnly
                          className="flex-1 px-4 py-3 rounded-lg border border-border bg-gray-50 text-text-primary"
                        />
                        <Button
                          type="button"
                          onClick={execDaumPostcode}
                          className="bg-[#4ccf89] hover:bg-[#45b87a] text-white"
                        >
                          주소 검색
                        </Button>
                      </div>
                      
                    </div>

                    {/* 도로명 주소 */}
                    {roadAddress && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          도로명 주소
                        </label>
                        <input
                          type="text"
                          value={roadAddress}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-border bg-gray-50 text-text-primary"
                        />
                      </div>
                    )}

                    {/* 지번 주소 */}
                    {jibunAddress && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          지번 주소
                        </label>
                        <input
                          type="text"
                          value={jibunAddress}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-border bg-gray-50 text-text-primary"
                        />
                      </div>
                    )}

                    {/* 건물명 */}
                    {buildingName && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          건물명
                        </label>
                        <input
                          type="text"
                          value={buildingName}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-border bg-gray-50 text-text-primary"
                        />
                      </div>
                    )}

                    {/* 상세 주소 */}
                    {roadAddress && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          상세 주소 (선택)
                        </label>
                        <input
                          type="text"
                          placeholder="동/호수 등을 입력하세요"
                          value={detailAddress}
                          onChange={(e) => setDetailAddress(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      className="mt-6 bg-[#4ccf89] hover:bg-[#45b87a] text-white"
                      disabled={loading || !postcode || !roadAddress}
                    >
                      {loading ? '처리 중...' : '회원가입 완료'}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </>
          )}

          {step === 'basic' && (
            <div className="text-center pt-4">
              <Link href="/auth/login" className="text-sm text-text-secondary">
                이미 계정이 있으신가요? <span className="text-primary font-medium">로그인</span>
              </Link>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}

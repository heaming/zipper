/**
 * 회원가입 페이지
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent } from '@ui/index'
import { apiClient } from '@/lib/api-client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!email || !password || !nickname) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setLoading(true)
      await apiClient.signup({ email, password, nickname })
      
      // 회원가입 성공 - 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다! 로그인해주세요.')
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="text-text-primary">
            ← 뒤로
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto pt-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">회원가입</h1>
          <p className="text-sm text-text-secondary mb-6">
            ZIPPER 커뮤니티에 가입하세요
          </p>

          <form onSubmit={handleSubmit}>
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
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="8자 이상 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    닉네임
                  </label>
                  <input
                    type="text"
                    placeholder="2-10자, 한글/영문/숫자"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={2}
                    maxLength={10}
                    pattern="[가-힣a-zA-Z0-9]+"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    ⚠️ 닉네임은 변경할 수 없으니 신중하게 작성해주세요
                  </p>
                </div>

                <Button type="submit" fullWidth className="mt-6" disabled={loading}>
                  {loading ? '처리 중...' : '회원가입'}
                </Button>

                <div className="text-center pt-4">
                  <Link href="/auth/login" className="text-sm text-text-secondary">
                    이미 계정이 있으신가요? <span className="text-primary font-medium">로그인</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}

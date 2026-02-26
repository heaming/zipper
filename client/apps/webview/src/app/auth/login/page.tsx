/**
 * 로그인 페이지
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent } from '@ui/index'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.login({ email, password })
      
      // 로그인 성공 - 상태 저장 및 홈으로 이동
      login(response.user, response.accessToken)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="flex items-center gap-1 text-text-primary">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            <span>뒤로</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto pt-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">로그인</h1>
          <p className="text-sm text-text-secondary mb-6">
            ZIPPER에 오신 것을 환영합니다
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
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <Button type="submit" fullWidth className="mt-6" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </Button>

                <div className="text-center pt-4">
                  <Link href="/auth/signup" className="text-sm text-text-secondary">
                    계정이 없으신가요? <span className="text-primary font-medium">회원가입</span>
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

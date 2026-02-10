/**
 * 내 정보 (마이페이지)
 */
'use client'

import { User, FileText, ShoppingBasket, Gift, Bell, Building2, Settings, ChevronRight } from 'lucide-react'
import { Card, CardContent, Divider, Button } from '@ui/index'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { logout, user } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
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
              <div>
                <h2 className="text-lg font-bold text-text-primary">{user?.email.split('@')[0] || '사용자'}</h2>
                <p className="text-sm text-text-secondary">○○동 · 인증 완료</p>
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

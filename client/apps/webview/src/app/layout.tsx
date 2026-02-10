'use client'

import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, MessageCircle, User } from 'lucide-react'
import '../styles/globals.scss'

// 하단 네비게이션을 숨길 경로들
const hideNavPaths = ['/auth/login', '/auth/signup']

function BottomNav() {
  const pathname = usePathname()
  
  // 로그인/회원가입 페이지에서는 네비게이션 숨김
  if (hideNavPaths.includes(pathname)) {
    return null
  }

  const navItems = [
    { href: '/home', icon: Home, label: '홈' },
    { href: '/community', icon: Users, label: '커뮤니티' },
    { href: '/chat', icon: MessageCircle, label: '채팅' },
    { href: '/profile', icon: User, label: '내정보' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-bottom z-40 rounded-t-3xl shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center touch-area"
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? 'text-text-primary' : 'text-gray-400'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 0 : 1.5}
              />
              <span className={`text-xs mt-1 ${
                isActive ? 'text-text-primary font-medium' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <div className="page-container">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}

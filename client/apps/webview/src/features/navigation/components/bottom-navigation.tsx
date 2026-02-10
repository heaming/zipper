'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/community', label: '커뮤니티', icon: '📋' },
  { href: '/write', label: '', icon: '➕', isCenter: true },
  { href: '/chat', label: '채팅', icon: '💬' },
  { href: '/profile', label: '내정보', icon: '👤' },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 bg-surface border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          // 중앙 + 버튼 (플로팅 스타일)
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors">
                  <span className="text-2xl text-white">{item.icon}</span>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center touch-area transition-colors',
                isActive ? 'text-primary' : 'text-text-secondary'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

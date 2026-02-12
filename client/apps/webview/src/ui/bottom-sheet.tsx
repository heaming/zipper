/**
 * Bottom Sheet 컴포넌트 (토스앱 스타일)
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

// 애니메이션 스타일 추가
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `
  if (!document.head.querySelector('style[data-bottom-sheet-animations]')) {
    style.setAttribute('data-bottom-sheet-animations', 'true')
    document.head.appendChild(style)
  }
}

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ open, onOpenChange, children, title }: BottomSheetProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      
      {/* Bottom Sheet Content */}
      <div
        className="relative z-50 w-full bg-surface rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function BottomSheetContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

'use client'

import { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@ui/index'

type Props = {
  title: string
  onBack: () => void
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
  children: ReactNode
}

export function WriteScaffold({
  title,
  onBack,
  actionLabel,
  onAction,
  actionDisabled,
  children,
}: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-text-secondary">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            <span>뒤로</span>
          </button>
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          {actionLabel ? (
            <Button size="sm" onClick={onAction} disabled={actionDisabled}>
              {actionLabel}
            </Button>
          ) : (
            <div className="w-[56px]" />
          )}
        </div>
      </header>

      {children}
    </div>
  )
}


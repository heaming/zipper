'use client'

import { ReactNode } from 'react'
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
          <button onClick={onBack} className="text-text-secondary">
            ← 뒤로
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


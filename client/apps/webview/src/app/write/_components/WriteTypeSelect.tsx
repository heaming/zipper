'use client'

import { Card, CardContent } from '@ui/index'
import { CommunityTag, TAG_ICONS, TAG_LABELS } from '@zipper/models/src/community'

import { writeOptions } from '../_constants'

type Props = {
  onSelect: (tag: CommunityTag) => void
  onClose: () => void
}

export function WriteTypeSelect({ onSelect, onClose }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">글쓰기</h1>
          <button onClick={onClose} className="text-text-secondary">
            ✕
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <p className="text-sm text-text-secondary mb-4">무엇을 하고 싶으신가요?</p>

        <div className="space-y-3">
          {writeOptions.map((option) => {
            const Icon = TAG_ICONS[option.tag]
            return (
              <Card
                key={option.tag}
                onClick={() => onSelect(option.tag)}
                className="cursor-pointer hover:border-primary transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />}
                    <div>
                      <h3 className="font-semibold text-text-primary">{TAG_LABELS[option.tag]}</h3>
                      <p className="text-sm text-text-secondary">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}


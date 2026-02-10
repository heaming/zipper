import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Toss 스타일 Divider (얇은 구분선)
 */

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * thick: 두꺼운 구분선 (섹션 구분용)
   */
  thick?: boolean
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, thick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        thick ? 'h-2 bg-surface' : 'h-px bg-border',
        className
      )}
      role="separator"
      {...props}
    />
  )
)
Divider.displayName = 'Divider'

export { Divider }

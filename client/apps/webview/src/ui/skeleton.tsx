import { cn } from '@/lib/utils'

/**
 * Skeleton 로딩 컴포넌트
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface', className)}
      {...props}
    />
  )
}

export { Skeleton }

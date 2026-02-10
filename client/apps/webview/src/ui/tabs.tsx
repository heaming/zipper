/**
 * Tabs 컴포넌트 (shadcn/ui 스타일)
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide',
        'px-4 py-2',
        className
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({
  value: triggerValue,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value, onValueChange } = useTabs()
  const isActive = value === triggerValue

  return (
    <button
      type="button"
      onClick={() => onValueChange(triggerValue)}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
        'flex-shrink-0',
        isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-text-secondary hover:bg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({
  value: contentValue,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value } = useTabs()

  if (value !== contentValue) return null

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

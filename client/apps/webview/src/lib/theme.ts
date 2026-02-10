/**
 * Toss 스타일 디자인 토큰
 */

export const colors = {
  // Background (회색 배경 + 흰 카드)
  background: '#f7f7f8',  // 기본 회색 배경
  surface: '#ffffff',      // 카드는 흰색
  
  // Text
  text: {
    primary: '#111111',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  
  // Border
  border: '#e5e7eb',
  
  // Primary (Point color)
  primary: {
    default: '#4ccf89',
    light: '#6fd99d',
    dark: '#3cb575',
  },
  
  // Status
  status: {
    success: '#4ccf89',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
} as const

export const spacing = {
  touch: '44px', // 최소 터치 영역
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
} as const

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
} as const

export const animations = {
  duration: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const

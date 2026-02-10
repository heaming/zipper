/**
 * 환경 변수 타입 안전하게 관리
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const

/**
 * 플랫폼 감지
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function isWebView(): boolean {
  if (typeof window === 'undefined') return false
  
  // iOS WebView 감지
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent)
  
  // Android WebView 감지
  const isAndroidWebView = /wv/.test(navigator.userAgent) || /Version\/[\d.]+.*Chrome\/[.0-9]*/.test(navigator.userAgent)
  
  return isIOSWebView || isAndroidWebView
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (isIOS()) return 'ios'
  if (isAndroid()) return 'android'
  return 'web'
}

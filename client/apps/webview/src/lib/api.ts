/**
 * API 싱글톤 (Light Hexagonal 아키텍처)
 *
 * @zipper/api-client 패키지의 createApiClient를 사용하는 WebView 앱 진입점.
 *
 * 사용법:
 *   import { api } from '@/lib/api'
 *   const posts = await api.community.getPosts({ boardType: 'FREE' })
 *   const rooms = await api.chat.getRooms(buildingId)
 *
 * 기존 코드(lib/api-client.ts apiClient)는 하위 호환성을 위해 유지됩니다.
 * 신규 기능은 이 싱글톤을 사용하세요.
 */

import { createApiClient } from '@zipper/api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * 토큰 getter — WebView localStorage 기반
 * SSR 환경(typeof window === 'undefined') 안전 처리
 */
function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  const token = localStorage.getItem('accessToken')
  return Promise.resolve(token)
}

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30_000,
  getAuthToken,
})

export type { ApiClientInstance } from '@zipper/api-client'

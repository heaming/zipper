/**
 * API 클라이언트
 * - 백엔드 API 통신
 * - JWT 토큰 관리
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface ApiError {
  message: string
  statusCode: number
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    if (typeof window === 'undefined') return {}
    
    const token = localStorage.getItem('accessToken')
    if (!token) return {}
    
    return {
      'Authorization': `Bearer ${token}`,
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: '서버 오류가 발생했습니다.',
          statusCode: response.status,
        }))
        throw new Error(error.message || '요청 실패')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('네트워크 오류가 발생했습니다.')
    }
  }

  // Auth APIs
  async signup(data: {
    email: string
    password: string
    nickname?: string
  }) {
    return this.request<{ userId: string; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      accessToken: string
      refreshToken: string
      user: { id: string; email: string }
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Community APIs
  async getPosts(boardType?: string, limit: number = 20) {
    const params = new URLSearchParams()
    if (boardType && boardType !== 'all') params.append('boardType', boardType)
    params.append('limit', limit.toString())
    
    return this.request<any[]>(`/api/community/posts?${params.toString()}`)
  }

  async getPost(id: number) {
    return this.request<any>(`/api/community/posts/${id}`)
  }

  async getComments(postId: number) {
    return this.request<any[]>(`/api/community/posts/${postId}/comments`)
  }

  // Building APIs
  async searchBuildings(keyword: string) {
    return this.request<any[]>(`/buildings/search?keyword=${encodeURIComponent(keyword)}`)
  }

  async getBuildings() {
    return this.request<any[]>('/buildings')
  }
}

export const apiClient = new ApiClient()

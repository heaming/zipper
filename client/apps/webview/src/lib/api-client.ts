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

  async getProfile() {
    return this.request<{
      id: string
      email: string
      buildings: Array<{ id: string; name: string; nickname: string }>
    }>('/api/auth/profile')
  }

  // Community APIs
  async getPosts(buildingId?: string, boardType?: string, limit: number = 20, page: number = 1) {
    if (!buildingId) {
      throw new Error('buildingId is required')
    }
    
    const params = new URLSearchParams()
    params.append('buildingId', buildingId)
    
    // Map frontend CommunityTag to backend BoardType
    if (boardType && boardType !== 'all' && typeof boardType === 'string') {
      const boardTypeMap: Record<string, string> = {
        'togather': 'DELIVERY',  // 같이 사요 -> DELIVERY
        'share': 'FREE',         // 나눔 -> FREE
        'lifestyle': 'LIFESTYLE', // ZIP 생활 -> LIFESTYLE
        'chat': 'FREE',          // 잡담 -> FREE
        'market': 'FREE',        // ZIP 마켓 -> FREE
      }
      const mappedBoardType = boardTypeMap[boardType.toLowerCase()]
      if (mappedBoardType) {
        params.append('boardType', mappedBoardType)
      }
    }
    
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    
    return this.request<{
      posts: any[]
      total: number
      page: number
      limit: number
    }>(`/api/community/posts?${params.toString()}`)
  }

  async getPost(id: number) {
    return this.request<any>(`/api/community/posts/${id}`)
  }

  async getComments(postId: number, page: number = 1, limit: number = 20, beforeId?: number) {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (beforeId) {
      params.append('beforeId', beforeId.toString())
    }
    
    return this.request<{
      comments: any[]
      total: number
      page: number
      limit: number
      hasMore: boolean
    }>(`/api/community/posts/${postId}/comments?${params.toString()}`)
  }

  async createComment(postId: number, content: string, parentCommentId?: number) {
    return this.request<any>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    })
  }

  async toggleLike(postId: number) {
    return this.request<{ liked: boolean }>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
    })
  }

  async incrementView(postId: number) {
    return this.request<{ viewCount: number }>(`/api/community/posts/${postId}/view`, {
      method: 'POST',
    })
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

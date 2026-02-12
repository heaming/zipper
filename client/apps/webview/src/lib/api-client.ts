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
  async checkEmailExists(email: string) {
    return this.request<{ exists: boolean }>('/api/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async checkNicknameExists(nickname: string) {
    return this.request<{ exists: boolean }>('/api/auth/check-nickname', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    })
  }

  async checkPhoneNumberExists(phoneNumber: string) {
    return this.request<{ exists: boolean }>('/api/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    })
  }

  async signup(data: {
    email: string
    password: string
    nickname: string
    phoneNumber: string
    buildingId: number
    dong?: string
    ho?: string
  }) {
    return this.request<{ userId: string; buildingId: number; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      accessToken: string
      refreshToken: string
      user: {
        id: string
        email: string
        nickname: string
        phoneNumber?: string
        buildingId?: number
        buildingName?: string
        dong?: string
        ho?: string
        buildingVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
        createdAt: string
        updatedAt: string
      }
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
    return this.request<{ buildings: Array<{ id: number; name: string; address: string; buildingType?: string }> }>(
      `/api/buildings/search?q=${encodeURIComponent(keyword)}`
    )
  }

  async createBuilding(data: {
    name: string
    roadAddress?: string
    jibunAddress?: string
    bname?: string
    sido?: string
    sigungu?: string
    buildingType?: string
  }) {
    return this.request<{ id: number; name: string; roadAddress?: string; jibunAddress?: string }>('/api/buildings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getBuildings() {
    return this.request<any[]>('/buildings')
  }

  // Email Verification APIs
  async sendEmailVerificationCode(data: { email: string }) {
    return this.request<{ message: string }>('/api/auth/send-email-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyEmailCode(data: { email: string; code: string }) {
    return this.request<{ verified: boolean }>('/api/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Building Verification APIs
  async verifyBuildingByGps(data: {
    buildingId: number
    latitude: number
    longitude: number
  }) {
    return this.request<{
      verificationId: number
      status: 'PENDING' | 'VERIFIED' | 'REJECTED'
      distance?: number
    }>('/api/auth/verify-residence/gps', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyBuildingByPostMail(data: {
    buildingId: number
    photo: File
  }) {
    const formData = new FormData()
    formData.append('buildingId', data.buildingId.toString())
    formData.append('photo', data.photo)

    return this.request<{
      verificationId: number
      status: 'PENDING' | 'VERIFIED' | 'REJECTED'
      message?: string
    }>('/api/auth/verify-residence/post-mail', {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeader(),
        // FormData는 Content-Type을 자동으로 설정하므로 제거
      },
    })
  }

  async verifyBuildingByIdCard(data: {
    buildingId: number
    idCard: File
  }) {
    const formData = new FormData()
    formData.append('buildingId', data.buildingId.toString())
    formData.append('idCard', data.idCard)

    return this.request<{
      verificationId: number
      status: 'PENDING' | 'VERIFIED' | 'REJECTED'
      message?: string
    }>('/api/auth/verify-residence/id-card', {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeader(),
      },
    })
  }
}

export const apiClient = new ApiClient()

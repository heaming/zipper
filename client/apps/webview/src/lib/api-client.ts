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
    
    // 디버깅: 실제 요청 URL 확인
    if (typeof window !== 'undefined' && endpoint.includes('images/upload')) {
      console.log('[API Client] Request URL:', url)
      console.log('[API Client] API_URL:', API_URL)
    }
    
    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
    const isFormData = options.body instanceof FormData
    const headers: HeadersInit = {
      ...this.getAuthHeader(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // 디버깅: 에러 응답 상세 정보
        if (typeof window !== 'undefined' && endpoint.includes('images/upload')) {
          console.error('[API Client] Response status:', response.status)
          console.error('[API Client] Response statusText:', response.statusText)
          console.error('[API Client] Response URL:', response.url)
        }
        
        const error: ApiError = await response.json().catch(() => ({
          message: response.status === 401 ? '인증이 만료되었습니다. 다시 로그인해주세요.' : `서버 오류가 발생했습니다. (${response.status})`,
          statusCode: response.status,
        }))
        
        // 401 Unauthorized 오류는 특별한 에러로 표시
        if (response.status === 401) {
          throw new Error(error.message || '인증이 만료되었습니다. 다시 로그인해주세요.')
        }
        
        throw new Error(error.message || '요청 실패')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        // 네트워크 에러인 경우 더 자세한 정보 제공
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          console.error('[API Client] Network error. Check if backend server is running at:', API_URL)
          throw new Error(`백엔드 서버에 연결할 수 없습니다. 서버가 ${API_URL}에서 실행 중인지 확인해주세요.`)
        }
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
    return this.request<{ userId: number; buildingId: number; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      accessToken: string
      refreshToken: string
      user: {
        id: number
        email: string
        nickname: string
        phoneNumber?: string
        buildingId?: number
        buildingName?: string
        bname?: string
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
      id: number
      email: string
      buildings: Array<{ id: number; name: string; nickname: string }>
    }>('/api/auth/profile')
  }

  async getLevel() {
    return this.request<{
      level: number
      icon: string
      name: string
      color: string
      activityScore: number
      progress: number
      remainingPoints: number
    }>('/api/auth/level')
  }

  // Community APIs
  async getPosts(buildingId?: number, boardType?: string, limit: number = 20, page: number = 1) {
    if (!buildingId) {
      throw new Error('buildingId is required')
    }
    
    const params = new URLSearchParams()
    params.append('buildingId', buildingId.toString())
    
    // Map frontend CommunityTag to backend BoardType
    if (boardType && boardType !== 'all' && typeof boardType === 'string') {
      params.append('boardType', boardType)
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

  async joinTogatherPost(postId: number) {
    return this.request<{ success: boolean; message: string; participantCount: number }>(
      `/api/community/posts/${postId}/join`,
      {
        method: 'POST',
      }
    )
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

  async uploadImages(files: File[]): Promise<{ imageUrls: string[] }> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    return this.request<{ imageUrls: string[] }>('/api/community/images/upload', {
      method: 'POST',
      body: formData,
    })
  }

  async createPost(data: {
    boardType: string
    title: string
    content: string
    imageUrls?: string[]
    meta?: {
      price?: number
      quantity?: number
      deadline?: string
      locationDetail?: string
      extraData?: Record<string, any>
    }
  }) {
    return this.request<{
      id: number
      title: string
      createdAt: string
    }>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Activity APIs (내 활동 내역)
  async getMyPosts(page: number = 1, limit: number = 20) {
    return this.request<{
      posts: any[]
      total: number
      page: number
      limit: number
    }>(`/api/community/activity/posts?page=${page}&limit=${limit}`)
  }

  async getMyComments(page: number = 1, limit: number = 20) {
    return this.request<{
      comments: any[]
      total: number
      page: number
      limit: number
    }>(`/api/community/activity/comments?page=${page}&limit=${limit}`)
  }

  async getMyLikedPosts(page: number = 1, limit: number = 20) {
    return this.request<{
      posts: any[]
      total: number
      page: number
      limit: number
    }>(`/api/community/activity/likes?page=${page}&limit=${limit}`)
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

  async getBuildingById(buildingId: number) {
    return this.request<{
      id: number
      name: string
      roadAddress?: string
      jibunAddress?: string
      sido?: string
      sigungu?: string
      bname?: string
      buildingType?: string
      totalHouseholds?: number
      memberCount: number
      isMember: boolean
    }>(`/api/buildings/${buildingId}`)
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

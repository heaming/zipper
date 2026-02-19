import type { ApiClient } from './client'

/**
 * Community API
 */

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  buildingId: number
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  imageUrls: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  isHot: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  title: string
  content: string
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  imageUrls?: string[]
}

export class CommunityApi {
  constructor(private client: ApiClient) {}

  async getPosts(params: {
    buildingId: number
    boardType?: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
    page?: number
    limit?: number
  }): Promise<{ posts: Post[]; total: number }> {
    const query = new URLSearchParams(params as any).toString()
    return this.client.get(`/api/community/posts?${query}`)
  }

  async getHotPosts(buildingId: number): Promise<Post[]> {
    return this.client.get(`/api/community/posts/hot?buildingId=${buildingId}`)
  }

  async getPost(postId: number): Promise<Post> {
    return this.client.get(`/api/community/posts/${postId}`)
  }

  async createPost(data: CreatePostRequest): Promise<{ id: number }> {
    return this.client.post('/api/community/posts', data)
  }

  async likePost(postId: number): Promise<void> {
    return this.client.post(`/api/community/posts/${postId}/like`)
  }

  async unlikePost(postId: number): Promise<void> {
    return this.client.delete(`/api/community/posts/${postId}/like`)
  }
}

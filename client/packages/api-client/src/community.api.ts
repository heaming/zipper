import type { ApiClient } from './client'

/**
 * Community API
 */

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorNickname: string
  buildingId: string
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
    buildingId: string
    boardType?: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
    page?: number
    limit?: number
  }): Promise<{ posts: Post[]; total: number }> {
    const query = new URLSearchParams(params as any).toString()
    return this.client.get(`/api/community/posts?${query}`)
  }

  async getHotPosts(buildingId: string): Promise<Post[]> {
    return this.client.get(`/api/community/posts/hot?buildingId=${buildingId}`)
  }

  async getPost(postId: string): Promise<Post> {
    return this.client.get(`/api/community/posts/${postId}`)
  }

  async createPost(data: CreatePostRequest): Promise<{ id: string }> {
    return this.client.post('/api/community/posts', data)
  }

  async likePost(postId: string): Promise<void> {
    return this.client.post(`/api/community/posts/${postId}/like`)
  }

  async unlikePost(postId: string): Promise<void> {
    return this.client.delete(`/api/community/posts/${postId}/like`)
  }
}

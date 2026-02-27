import type { ApiClient } from './client'
import type {
  Post,
  BoardType,
  CreatePostRequest,
  UpdatePostRequest,
} from './types/community.types'

export type { Post, BoardType, CreatePostRequest, UpdatePostRequest }

export interface GetPostsParams {
  boardType?: BoardType
  page?: number
  limit?: number
}

export class CommunityApi {
  constructor(private client: ApiClient) {}

  // 게시글 목록 (buildingId는 서버에서 JWT로 추출)
  async getPosts(params: GetPostsParams = {}): Promise<{ posts: Post[]; total: number }> {
    const query = new URLSearchParams()
    if (params.boardType) query.set('boardType', params.boardType)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.client.get(`/api/community/posts${qs ? `?${qs}` : ''}`)
  }

  // HOT 게시글 (buildingId 필요)
  async getHotPosts(buildingId: number): Promise<Post[]> {
    return this.client.get(`/api/community/posts/hot?buildingId=${buildingId}`)
  }

  // 게시글 상세
  async getPost(postId: number): Promise<Post> {
    return this.client.get(`/api/community/posts/${postId}`)
  }

  // 조회수 증가
  async incrementView(postId: number): Promise<void> {
    return this.client.post(`/api/community/posts/${postId}/view`)
  }

  // 게시글 작성
  async createPost(data: CreatePostRequest): Promise<{ id: number }> {
    return this.client.post('/api/community/posts', data)
  }

  // 게시글 수정
  async updatePost(postId: number, data: UpdatePostRequest): Promise<Post> {
    return this.client.put(`/api/community/posts/${postId}`, data)
  }

  // 게시글 삭제
  async deletePost(postId: number): Promise<void> {
    return this.client.delete(`/api/community/posts/${postId}`)
  }

  // 좋아요 토글 (POST로 통합 - 서버에서 toggle 처리)
  async togglePostLike(postId: number): Promise<{ liked: boolean; likeCount: number }> {
    return this.client.post(`/api/community/posts/${postId}/like`)
  }

  // 같이사요 참여 토글
  async joinPost(postId: number): Promise<{ joined: boolean; participantCount: number }> {
    return this.client.post(`/api/community/posts/${postId}/join`)
  }

  // 내 게시글 목록
  async getMyPosts(params: { page?: number; limit?: number } = {}): Promise<{ posts: Post[]; total: number }> {
    const query = new URLSearchParams(params as any).toString()
    return this.client.get(`/api/community/activity/posts${query ? `?${query}` : ''}`)
  }

  // 내 댓글 목록
  async getMyComments(params: { page?: number; limit?: number } = {}): Promise<{ comments: any[]; total: number }> {
    const query = new URLSearchParams(params as any).toString()
    return this.client.get(`/api/community/activity/comments${query ? `?${query}` : ''}`)
  }

  // 내 좋아요 게시글
  async getMyLikedPosts(params: { page?: number; limit?: number } = {}): Promise<{ posts: Post[]; total: number }> {
    const query = new URLSearchParams(params as any).toString()
    return this.client.get(`/api/community/activity/likes${query ? `?${query}` : ''}`)
  }
}

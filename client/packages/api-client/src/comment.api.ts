import type { ApiClient } from './client'
import type { Comment, CreateCommentRequest } from './types/community.types'

export class CommentApi {
  constructor(private client: ApiClient) {}

  // 댓글 목록 조회
  async getComments(
    postId: number,
    params: { page?: number; limit?: number } = {},
  ): Promise<{ comments: Comment[]; total: number }> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.client.get(`/api/community/posts/${postId}/comments${qs ? `?${qs}` : ''}`)
  }

  // 댓글 작성
  async createComment(postId: number, data: CreateCommentRequest): Promise<Comment> {
    return this.client.post(`/api/community/posts/${postId}/comments`, data)
  }

  // 댓글 수정
  async updateComment(commentId: number, content: string): Promise<Comment> {
    return this.client.put(`/api/community/comments/${commentId}`, { content })
  }

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<void> {
    return this.client.delete(`/api/community/comments/${commentId}`)
  }

  // 댓글 좋아요 토글
  async toggleCommentLike(commentId: number): Promise<{ liked: boolean; likeCount: number }> {
    return this.client.post(`/api/community/comments/${commentId}/like`)
  }
}

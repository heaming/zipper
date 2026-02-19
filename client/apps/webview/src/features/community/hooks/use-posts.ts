'use client'

import { create } from 'zustand'

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  buildingId: number
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  likeCount: number
  commentCount: number
  viewCount: number
  isHot: boolean
  createdAt: string
}

interface PostsStore {
  posts: Post[]
  hotPosts: Post[]
  setPosts: (posts: Post[]) => void
  setHotPosts: (posts: Post[]) => void
}

/**
 * 게시물 상태 관리 (Zustand)
 */
export const usePosts = create<PostsStore>((set) => ({
  posts: [],
  hotPosts: [],
  
  setPosts: (posts) => set({ posts }),
  setHotPosts: (posts) => set({ hotPosts: posts }),
}))

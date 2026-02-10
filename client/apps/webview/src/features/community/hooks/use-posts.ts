'use client'

import { create } from 'zustand'

interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorNickname: string
  buildingId: string
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

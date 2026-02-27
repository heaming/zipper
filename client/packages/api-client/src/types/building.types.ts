/**
 * 건물 도메인 타입
 */

export interface Building {
  id: number
  name: string
  address: string
  dong?: string
  ho?: string
  latitude?: number
  longitude?: number
  memberCount?: number
  inviteCode?: string
  createdAt: string
}

export interface BuildingSearchResult {
  id: number
  name: string
  address: string
  latitude?: number
  longitude?: number
}

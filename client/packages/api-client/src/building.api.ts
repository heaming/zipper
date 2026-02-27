import type { ApiClient } from './client'
import type { Building, BuildingSearchResult } from './types/building.types'

export class BuildingApi {
  constructor(private client: ApiClient) {}

  // 건물 검색 (회원가입 시 주소 검색, Public 엔드포인트)
  async searchBuildings(query: string): Promise<BuildingSearchResult[]> {
    return this.client.get(`/api/buildings/search?q=${encodeURIComponent(query)}`)
  }

  // 건물 상세 조회
  async getBuilding(buildingId: number): Promise<Building> {
    return this.client.get(`/api/buildings/${buildingId}`)
  }

  // 내 건물 목록
  async getMyBuildings(): Promise<Building[]> {
    return this.client.get('/api/buildings/my')
  }
}

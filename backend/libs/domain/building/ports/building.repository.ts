// Repository Port 인터페이스 (Nest 의존성 ❌)
import { Building } from '../models/building';

export interface BuildingRepository {
  findById(id: string): Promise<Building | null>;
  findByInviteCode(inviteCode: string): Promise<Building | null>;
  search(query: string, limit?: number): Promise<Building[]>;
  save(building: Building): Promise<Building>;
}

export const BUILDING_REPOSITORY = Symbol('BUILDING_REPOSITORY');

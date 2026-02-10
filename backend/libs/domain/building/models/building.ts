// 순수 도메인 모델 (Nest 의존성 ❌)
export enum BuildingType {
  APARTMENT = 'APARTMENT',
  OFFICETEL = 'OFFICETEL',
  VILLA = 'VILLA',
}

export class Building {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly buildingType: BuildingType,
    public readonly inviteCode: string,
    public addressDetail?: string,
    public totalUnits?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isNearby(lat: number, lng: number, radiusInMeters: number = 100): boolean {
    // 간단한 거리 계산 (실제로는 Haversine 공식 사용)
    const latDiff = Math.abs(this.latitude - lat);
    const lngDiff = Math.abs(this.longitude - lng);
    const approximateDistance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111000; // 대략적 계산
    return approximateDistance <= radiusInMeters;
  }
}

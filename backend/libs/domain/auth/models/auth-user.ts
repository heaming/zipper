// 인증된 사용자 정보 (VO)
export class AuthUser {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly buildingId?: number,
    public readonly nickname?: string,
  ) {}
}

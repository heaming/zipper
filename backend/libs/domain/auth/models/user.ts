// 순수 도메인 모델 (Nest 의존성 ❌)
export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public password: string,
    public phoneNumber?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date,
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  updatePassword(newPassword: string): void {
    this.password = newPassword;
  }
}

export class InviteCodeUtil {
  static generate(): string {
    // 8자리 랜덤 문자열 (대문자 + 숫자)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

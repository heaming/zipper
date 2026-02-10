/**
 * 공통 유틸리티 함수
 */

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검사
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('비밀번호는 8자 이상이어야 합니다.')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 랜덤 익명 닉네임 생성
 */
export function generateAnonymousNickname(): string {
  const adjectives = ['귀여운', '멋진', '신비로운', '용감한', '똑똑한', '친절한']
  const nouns = ['토끼', '고양이', '강아지', '판다', '호랑이', '여우']
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  
  return `${adj} ${noun}${num}`
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 배열을 청크로 분할
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 중복 제거
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Sleep (비동기 대기)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

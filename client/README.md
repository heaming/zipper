# ZIPPER Client (Frontend)

Next.js 기반의 WebView 앱 프론트엔드

## 🚀 빠른 시작

### 로컬 개발 (권장)

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Hot Reload)
npm run dev
```

브라우저에서 http://localhost:3001 접속

### Docker로 실행

```bash
# 프로젝트 루트에서
docker-compose up -d frontend

# 또는 전체 스택 실행
docker-compose up -d
```

## 📁 프로젝트 구조

```
client/
├── apps/
│   └── webview/          # Next.js 앱
│       ├── src/
│       │   ├── app/      # App Router
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── stores/   # Zustand 상태 관리
│       │   └── lib/      # 유틸리티
│       ├── public/       # 정적 파일
│       └── next.config.js
└── packages/             # 공유 패키지
    ├── api-client/       # API 클라이언트
    ├── models/           # 타입 정의
    └── utils/            # 유틸리티
```

## 🛠 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm run start

# 린트
npm run lint
```

## 🌐 환경 변수

`.env.local` 파일이 생성되어 있습니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **React**: 18
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## 📦 Docker 관련

### 로컬 개발용 Docker

```bash
# 프론트엔드만 실행
docker-compose up -d frontend

# 로그 확인
docker-compose logs -f frontend

# 재시작
docker-compose restart frontend

# 중지
docker-compose stop frontend
```

### 프로덕션 빌드

Dockerfile은 multi-stage 빌드를 사용하여 최적화되어 있습니다:

1. **deps**: 의존성 설치
2. **builder**: Next.js 빌드 (standalone 모드)
3. **runner**: 최소한의 런타임 환경

### 빌드 테스트

```bash
# 로컬에서 Docker 이미지 빌드
docker build -t zipper-frontend ./client

# 이미지 실행
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000 \
  zipper-frontend
```

## 🎨 개발 가이드

### 새 페이지 추가

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

### API 호출

```typescript
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`).then(r => r.json())
  })
  
  // ...
}
```

### 상태 관리 (Zustand)

```typescript
import { create } from 'zustand'

interface UserStore {
  user: User | null
  setUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## 🐛 문제 해결

### 포트 충돌

```bash
# 3001 포트 확인
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

### 캐시 문제

```bash
# Next.js 캐시 삭제
rm -rf apps/webview/.next

# node_modules 재설치
rm -rf node_modules
npm install
```

### Docker 빌드 실패

```bash
# 빌드 캐시 없이 재빌드
docker-compose build --no-cache frontend

# 이미지 삭제 후 재빌드
docker rmi zipper-frontend
docker-compose build frontend
```

## 📱 WebView 최적화

이 프로젝트는 모바일 WebView를 위해 최적화되어 있습니다:

- CSS 최적화
- 이미지 WebP 포맷
- 번들 크기 최소화
- 빠른 초기 로딩

## 🔗 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

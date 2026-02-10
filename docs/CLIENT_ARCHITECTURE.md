# ZIPPER Client 아키텍처

## 핵심 철학

> **WebView First, Native는 Shell**
> 
> ZIPPER Client는 WebView 중심으로 설계되었습니다.  
> iOS/Android Native는 WebView를 감싸는 Shell이며,  
> 모든 UI/UX/비즈니스는 WebView가 담당합니다.

---

## 디렉토리 구조

```
client/
├── apps/
│   └── webview/              # WebView 전용 Next.js 앱
│       ├── src/
│       │   ├── app/          # App Router (라우팅만)
│       │   ├── features/     # 기능 단위 (비즈니스 중심)
│       │   ├── ui/           # Toss 스타일 UI 컴포넌트
│       │   ├── bridges/      # Native ↔ Web 통신
│       │   ├── lib/          # 유틸, 설정
│       │   └── styles/       # Tailwind CSS
│       └── package.json
│
├── packages/
│   ├── api-client/           # Backend API SDK
│   ├── models/               # 공통 타입 (Frontend용)
│   └── utils/                # 순수 유틸
│
└── package.json
```

---

## 레이어별 책임

### 1. app/ (라우팅 전용)

**역할**: 페이지 정의만 한다

**금지**:
- ❌ API 호출
- ❌ 비즈니스 로직
- ❌ 상태 관리

**예시**:
```tsx
// ✅ Good: app/community/page.tsx
export default function CommunityPage() {
  return <CommunityScreen />
}

// ❌ Bad: app/community/page.tsx
export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  
  useEffect(() => {
    fetch('/api/posts').then(...)  // ❌ 금지
  }, [])
  
  return <PostList posts={posts} />
}
```

---

### 2. features/ (핵심 비즈니스 영역)

**구조**:
```
features/
├── community/
│   ├── components/      # UI 컴포넌트
│   ├── hooks/           # 상태 관리 (Zustand)
│   ├── services/        # API 호출
│   └── types.ts         # 타입 정의
```

**규칙**:
- ✅ API 호출은 `services/`에서만
- ✅ 상태 관리는 `hooks/`에서만
- ✅ Feature 내부에서만 사용하는 타입은 `types.ts`에

**예시**:
```tsx
// ✅ features/community/services/post.service.ts
export async function fetchPosts(buildingId: string) {
  return api.community.getPosts({ buildingId })
}

// ✅ features/community/hooks/use-posts.ts
export const usePosts = create((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}))

// ✅ features/community/components/post-list.tsx
export function PostList() {
  const { posts } = usePosts()
  return <div>{/* ... */}</div>
}
```

---

### 3. ui/ (순수 UI)

**역할**: 디자인 컴포넌트만 존재

**금지**:
- ❌ API 호출
- ❌ 상태 관리 (Zustand, Context)
- ❌ Native Bridge 접근

**허용**:
- ✅ Props를 받아 렌더링
- ✅ 로컬 상태 (useState)
- ✅ 이벤트 핸들러 (콜백으로 전달받음)

**예시**:
```tsx
// ✅ ui/button.tsx
export function Button({ onClick, children, variant }) {
  return (
    <button className={...} onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ Bad
export function Button({ onClick }) {
  const { user } = useAuth()  // ❌ 상태 관리 접근 금지
  return <button>...</button>
}
```

---

### 4. bridges/ (Native ↔ WebView 통신)

**역할**: Native 기능 추상화

**구조**:
```
bridges/
├── index.ts          # 플랫폼 추상화 (진입점)
├── types.ts          # 인터페이스 정의
├── ios.bridge.ts     # iOS 구현
├── aos.bridge.ts     # Android 구현
└── web.bridge.ts     # 브라우저 fallback
```

**사용 예시**:
```tsx
import { NativeBridge } from '@bridges/index'

// ✅ 올바른 사용
const location = await NativeBridge.getLocation()
const image = await NativeBridge.pickImage()
NativeBridge.vibrate()

// ❌ 직접 접근 금지
window.webkit.messageHandlers.zipper.postMessage(...)
window.ZipperAndroid.getLocation()
```

**지원 기능**:
- 위치 정보 (GPS)
- 카메라 / 이미지 선택
- 진동
- 알림 권한
- Secure Storage
- 공유
- 딥링크

---

### 5. packages/ (공유 모듈)

#### api-client (Backend API SDK)

**역할**: Backend API 통신 전담

**특징**:
- ✅ fetch/axios 여기서만 사용
- ✅ accessToken 주입 자동 처리
- ✅ 타임아웃, 에러 핸들링 통합

**사용 예시**:
```tsx
import { createApiClient } from '@zipper/api-client'

const api = createApiClient({
  baseUrl: 'http://localhost:3000',
  getAuthToken: async () => {
    return NativeBridge.getSecureItem('auth_token')
  }
})

// 로그인
const { accessToken, user } = await api.auth.login({ email, password })

// 게시물 목록
const { posts } = await api.community.getPosts({ buildingId })
```

#### models (공통 타입)

**역할**: Frontend용 View Model

**특징**:
- Backend DTO와 1:1 매칭 불필요
- Frontend 기준의 타입 정의

**예시**:
```ts
export interface Post {
  id: string
  title: string
  content: string
  isHot: boolean
  // Frontend에서 필요한 필드만
}
```

#### utils (순수 유틸)

**역할**: 플랫폼 독립적인 유틸리티

**예시**:
```ts
import { isValidEmail, formatFileSize } from '@zipper/utils'

isValidEmail('test@example.com')  // true
formatFileSize(1024)  // "1 KB"
```

---

## Toss 스타일 디자인 시스템

### 컬러 팔레트

| 역할 | 색상 | Tailwind |
|-----|------|----------|
| Background | `#ffffff` | `bg-background` |
| Surface | `#f7f7f8` | `bg-surface` |
| Text Primary | `#111111` | `text-text-primary` |
| Text Secondary | `#6b7280` | `text-text-secondary` |
| Border | `#e5e7eb` | `border-border` |
| **Primary** | `#4ccf89` | `bg-primary` |

### UI 원칙

✅ **허용**:
- 흰 배경 중심
- 얇은 구분선 (1px)
- 그림자 최소
- 둥근 radius (md~lg)
- 의미 있는 애니메이션만

❌ **금지**:
- 그라데이션
- 복잡한 그림자
- 포인트 컬러 변경 (#4ccf89 고정)
- 과도한 애니메이션

---

## 상태 관리 전략

### 클라이언트 상태 (Zustand)

**언제 사용**:
- UI 상태 (모달, 토스트 등)
- 전역 사용자 정보
- Feature 내부 상태

**예시**:
```tsx
import { create } from 'zustand'

export const useAuth = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

### 서버 상태 (React Query)

**언제 사용**:
- API 데이터 fetching
- 캐싱, 동기화
- 백그라운드 업데이트

**예시**:
```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['posts', buildingId],
  queryFn: () => api.community.getPosts({ buildingId }),
  staleTime: 1000 * 60, // 1분
})
```

---

## Native 분리 가능성

### 현재: WebView First

```
┌─────────────────────┐
│  Native App (Shell) │
│  ┌───────────────┐  │
│  │   WebView     │  │
│  │  (100% UI/UX) │  │
│  └───────┬───────┘  │
│          │          │
│    Native Bridge    │
└─────────────────────┘
```

### 미래: Native 이관

```
┌─────────────────────┐
│  Native App         │
│  ├─ SwiftUI / Compose
│  ├─ Native Logic    │
│  └─ API Client ─────┼──> Backend
└─────────────────────┘
```

**WebView 수정 최소화 원칙**:
- `bridges/` 레이어만 교체
- Feature 로직은 재사용
- API Client 공유

---

## 개발 워크플로우

### 1. 새 기능 추가

```bash
# 1. Feature 디렉토리 생성
mkdir -p src/features/myfeature/{components,hooks,services}

# 2. API 정의 (packages/api-client)
# 3. 타입 정의 (packages/models)
# 4. Feature 구현
# 5. app/ 라우팅 추가
```

### 2. UI 컴포넌트 추가

```tsx
// ui/my-component.tsx
export function MyComponent({ ...props }) {
  // Toss 스타일 준수
  return <div className="bg-background border border-border">...</div>
}
```

### 3. Native 기능 추가

```ts
// bridges/types.ts에 인터페이스 추가
export interface NativeBridgeInterface {
  myNewFeature(): Promise<void>
}

// ios.bridge.ts, aos.bridge.ts, web.bridge.ts에 구현
```

---

## 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 우선

### 코드 스플리팅
- App Router 자동 스플리팅
- `dynamic()` import 활용

### 모바일 최적화
- 터치 영역 최소 44px
- Overscroll 방지
- 터치 하이라이트 제거

---

## 핵심 메시지

> **이 프로젝트는 WebView First 모바일 앱입니다.**  
> iOS/Android Native는 WebView를 감싸는 Shell이며,  
> UI/UX/비즈니스는 WebView가 전부 담당합니다.  
> Native 기능은 bridges 레이어로만 접근합니다.

---

**문서 작성일**: 2026-02-10

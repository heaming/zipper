# ZIPPER

거주 인증 기반 건물 커뮤니티 앱

## 아키텍처

### Backend: NestJS 기반 MA + 라이트 헥사고날

> 이 프로젝트는 NestJS 기반 Monolithic Architecture이며,  
> 교체 가능성이 있는 영역에만 라이트 헥사고날을 적용합니다.  
> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

### Client: WebView First + Toss 스타일

> WebView 중심 모바일 앱입니다.  
> iOS/Android Native는 WebView Shell이며, UI/UX/비즈니스는 WebView가 담당합니다.  
> Native 기능은 bridges 레이어로만 접근합니다.

자세한 내용은:
- Backend: [아키텍처 가이드](docs/ARCHITECTURE.md)
- Client: [Client 아키텍처](docs/CLIENT_ARCHITECTURE.md)

## 프로젝트 구조

```
zipper/
├── backend/
│   ├── apps/
│   │   └── api/              # NestJS Application (Nest 사용 ✅)
│   │       └── src/
│   │           ├── auth/          # Controller, Service, Module
│   │           ├── community/     # Controller, Service, Module
│   │           ├── common/        # Guards, Filters, Decorators
│   │           ├── app.module.ts
│   │           └── main.ts
│   │
│   ├── libs/
│   │   ├── domain/           # 순수 도메인 (Nest 의존성 ❌)
│   │   │   ├── auth/
│   │   │   │   ├── models/       # User, AuthUser
│   │   │   │   └── ports/        # Authenticator, UserRepository
│   │   │   ├── building/
│   │   │   ├── community/
│   │   │   └── chat/
│   │   │
│   │   ├── application/      # UseCase 계층 (Nest 의존성 ❌)
│   │   │   ├── auth/
│   │   │   │   ├── commands/     # LoginCommand, SignupCommand
│   │   │   │   └── usecases/     # LoginUseCase, SignupUseCase
│   │   │   ├── community/
│   │   │   └── chat/
│   │   │
│   │   └── infrastructure/   # Adapter 구현 (Nest 사용 ✅)
│   │       ├── auth/
│   │       │   ├── adapters/     # JwtAuthenticatorAdapter
│   │       │   ├── repositories/ # TypeOrmUserRepository
│   │       │   └── persistence/  # UserEntity (TypeORM)
│   │       ├── community/
│   │       └── notification/
│   │
│   └── package.json
│
├── client/          # 클라이언트 (WebView 기반 하이브리드 앱)
│   └── src/
│
├── docs/            # 문서
│   ├── ARCHITECTURE.md
│   ├── API_FLOW.md
│   ├── API_SPEC.md
│   ├── ERD.md
│   ├── WEBSOCKET_SPEC.md
│   └── HOT_POST_LOGIC.md
│
├── docker-compose.yml
└── README.md
```

## 기술 스택

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT

### Client
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Toss 스타일)
- **State**: Zustand + React Query
- **Native Bridge**: iOS/Android WebView 통신

## 🚀 빠른 시작

### 1️⃣ 로컬 개발 (권장)

```bash
# 1. DB와 Redis만 Docker로 실행
docker-compose up -d postgres redis

# 2. 백엔드 실행 (터미널 1)
cd backend
npm install
npm run start:dev
# → http://localhost:3000

# 3. 프론트엔드 실행 (터미널 2)
cd client
npm install
npm run dev
# → http://localhost:3001
```

### 2️⃣ Docker로 전체 실행

```bash
# 모든 서비스 실행 (DB, Redis, Backend, Frontend)
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

**실행 후 접속**:
- 프론트엔드: http://localhost:3001
- 백엔드 API: http://localhost:3000

### 3️⃣ 상세 가이드

- **로컬 개발**: [backend/QUICK_START.md](backend/QUICK_START.md)
- **Docker 가이드**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- **Backend 설정**: [backend/LOCAL_SETUP.md](backend/LOCAL_SETUP.md)
- **Frontend 설정**: [client/README.md](client/README.md)

## 주요 기능

- **인증**: JWT 기반 인증, 거주 인증 (GPS/초대 코드/사진)
- **건물 관리**: 건물 검색, 멤버십 관리
- **커뮤니티**: 게시판, 댓글, HOT 게시물 자동 계산
- **채팅**: 실시간 채팅 (WebSocket), 건물 전체 채팅방, 주제 채팅방
- **알림**: 댓글, 멘션, HOT 게시물 알림

## 문서

### 아키텍처 (필독 ⭐️)
- [Backend 아키텍처](docs/ARCHITECTURE.md) - **NestJS MA + 라이트 헥사고날**
- [Client 아키텍처](docs/CLIENT_ARCHITECTURE.md) - **WebView First + Toss 스타일**
- [리팩토링 완료 요약](docs/REFACTORING_SUMMARY.md) - Backend 리팩토링 내역
- [API 요청 흐름도](docs/API_FLOW.md) - 레이어별 흐름

### API & 데이터베이스
- [API 명세서](docs/API_SPEC.md)
- [ERD 설계](docs/ERD.md)
- [WebSocket 명세](docs/WEBSOCKET_SPEC.md)

### 비즈니스 로직
- [HOT 게시물 로직](docs/HOT_POST_LOGIC.md)

### 개발 가이드
- [Backend README](backend/README.md)
- [Client README](client/README.md)

## 라이선스

UNLICENSED

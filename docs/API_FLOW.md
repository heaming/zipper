# ZIPPER API 요청 흐름도

## 아키텍처 개요

ZIPPER 백엔드는 **NestJS 기반 Monolithic Architecture (MA)**이며,  
**교체 가능성이 있는 영역에만 라이트 헥사고날**을 적용했습니다.

> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

## 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         Client App                          │
│                    (iOS/Android WebView)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NestJS Backend (MA)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           apps/api (Nest 사용 ✅)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Controller   │  │   Gateway    │  │   Module    │ │ │
│  │  │              │  │ (WebSocket)  │  │  (DI 조립)  │ │ │
│  │  └──────┬───────┘  └──────────────┘  └─────────────┘ │ │
│  │         │ calls                                        │ │
│  │  ┌──────▼───────────────────────────────────────────┐ │ │
│  │  │  Service (DTO → Command 변환, UseCase 호출)     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              │ Command                       │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │       libs/application (Nest 의존성 ❌)                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  UseCases (비즈니스 로직 실행)                   │ │ │
│  │  │  - LoginUseCase, CreatePostUseCase               │ │ │
│  │  │  - Port 인터페이스에만 의존                      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              │ Port (Interface)              │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         libs/domain (Nest 의존성 ❌)                   │ │
│  │  ┌───────────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Models (순수 TS)  │  │  Ports (인터페이스)      │ │ │
│  │  │ User, Post, etc   │  │  Authenticator, Repo...  │ │ │
│  │  └───────────────────┘  └──────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              ▲                               │
│                              │ implements                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      libs/infrastructure (Nest 사용 ✅)                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Adapters (Port 구현체)                          │ │ │
│  │  │  - JwtAuthenticatorAdapter                       │ │ │
│  │  │  - TypeOrmUserRepository                         │ │ │
│  │  │  - TypeORM Entities                              │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │    PostgreSQL DB     │
                   └──────────────────────┘
```

---

## API 요청 흐름 상세

### 예시: 게시글 작성 API

```
POST /api/community/posts
{
  "buildingId": "uuid",
  "boardType": "FREE",
  "title": "제목",
  "content": "내용"
}
```

#### 1. Client → Backend (HTTP Request)

```
┌─────────────────┐
│   Client App    │
│  (iOS/Android)  │
└────────┬────────┘
         │ POST /api/community/posts
         │ Headers: Authorization: Bearer {jwt}
         │ Body: CreatePostDto
         ▼
```

#### 2. API Layer (apps/api)

```
┌──────────────────────────────────────────────────────────────┐
│  main.ts (apps/api/src/main.ts)                              │
│  ├─ CORS 설정                                                 │
│  ├─ ValidationPipe (DTO 검증)                                │
│  └─ HttpExceptionFilter (에러 처리)                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  JwtAuthGuard                                                │
│  ├─ AuthorizeUserUseCase 호출                                │
│  ├─ 사용자 인증 확인                                          │
│  └─ Request에 user 정보 주입                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  CommunityController.createPost()                            │
│  ├─ @UseGuards(JwtAuthGuard)                                 │
│  ├─ @CurrentUser() decorator로 사용자 정보 추출              │
│  ├─ @Body() CreatePostDto 검증                               │
│  └─ communityService.createPost() 호출                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
```

#### 3. Service Layer (apps/api)

```
┌──────────────────────────────────────────────────────────────┐
│  CommunityService.createPost(dto, user)                      │
│  ├─ 1. DTO → Command 변환                                    │
│  │   └─ CreatePostCommand(user.id, dto.buildingId, ...)     │
│  │                                                            │
│  └─ 2. UseCase 호출                                           │
│      └─ createPostUseCase.execute(command)                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
```

#### 4. Application Layer (libs/application)

```
┌──────────────────────────────────────────────────────────────┐
│  CreatePostUseCase.execute(command)                          │
│  ├─ 1. 도메인 모델 생성                                       │
│  │   └─ new Post(userId, buildingId, title, content)        │
│  │                                                            │
│  ├─ 2. Repository Port 호출                                   │
│  │   └─ postRepository.save(post)                            │
│  │                                                            │
│  └─ 3. 응답 반환                                              │
│      └─ { id, title, createdAt }                             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
```

#### 5. Domain Layer (libs/domain)

```
┌──────────────────────────────────────────────────────────────┐
│  Post Model (libs/domain/community/models/post.ts)           │
│  ├─ 순수 TypeScript 클래스                                    │
│  ├─ 비즈니스 규칙 포함 (incrementLike, updateHotScore)       │
│  └─ Nest 의존성 없음 ❌                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
```

#### 6. Infrastructure Layer (libs/infrastructure)

```
┌──────────────────────────────────────────────────────────────┐
│  TypeOrmPostRepository (Adapter)                             │
│  ├─ PostRepository Port 구현                                 │
│  ├─ Domain Model ↔ ORM Entity 변환                          │
│  ├─ SQL 쿼리 생성 (TypeORM)                                  │
│  │   INSERT INTO posts (id, title, content, ...)            │
│  │                                                            │
│  └─ DB 트랜잭션 처리                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                         │
│  └─ posts 테이블에 데이터 저장                                │
└──────────────────────────────────────────────────────────────┘
```

#### 7. Response

```
┌─────────────────┐
│   PostgreSQL    │
└────────┬────────┘
         │ Return PostEntity
         ▼
┌──────────────────────────────┐
│  TypeOrmPostRepository       │
│  (ORM Entity → Domain Model) │
└────────┬─────────────────────┘
         │ Return Post
         ▼
┌──────────────────────────────┐
│  CreatePostUseCase           │
└────────┬─────────────────────┘
         │ Return result
         ▼
┌──────────────────────────────┐
│  CommunityService            │
└────────┬─────────────────────┘
         │ Return response DTO
         ▼
┌──────────────────────────────┐
│  CommunityController         │
└────────┬─────────────────────┘
         │ HTTP 201 Created
         │ Body: { id, title, createdAt }
         ▼
┌──────────────────────────────┐
│      Client App              │
└──────────────────────────────┘
```

---

## WebSocket 요청 흐름

### 예시: 채팅 메시지 전송

```
Event: send-message
{
  "roomId": "uuid",
  "content": "메시지 내용"
}
```

#### 흐름

```
┌─────────────────┐
│   Client App    │
│  Socket.IO      │
└────────┬────────┘
         │ emit('send-message', data)
         │ Connection: JWT in handshake
         ▼
┌──────────────────────────────────────────────────────────────┐
│  ChatGateway.handleSendMessage()                             │
│  ├─ 1. Socket 연결에서 userId 추출                           │
│  ├─ 2. ChatService.sendMessage() 호출                        │
│  ├─ 3. DB에 메시지 저장                                       │
│  ├─ 4. Socket.IO room에 브로드캐스트                         │
│  │    └─ server.to(roomId).emit('new-message', data)        │
│  └─ 5. 전송자에게 확인 응답                                   │
│       └─ client.emit('message-sent', confirmation)           │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  같은 방의 모든 클라이언트                                     │
│  └─ on('new-message') → UI 업데이트                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 인증 흐름

### JWT 인증 과정

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │ POST /api/auth/login
         │ { email, password }
         ▼
┌──────────────────────────────────────────────────────────────┐
│  AuthController.login()                                      │
│  └─ AuthService.login(dto)                                   │
│      ├─ 1. User 조회 (email)                                 │
│      ├─ 2. Password 검증 (bcrypt)                            │
│      ├─ 3. JWT 토큰 생성                                      │
│      │   ├─ accessToken (1일)                                │
│      │   └─ refreshToken (7일)                               │
│      └─ 4. 응답 반환                                          │
└────────────────────┬─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Client App    │
│ Store Token in  │
│ Secure Storage  │
└────────┬────────┘
         │
         │ 이후 모든 요청에 포함
         │ Authorization: Bearer {accessToken}
         ▼
┌──────────────────────────────────────────────────────────────┐
│  JwtAuthGuard                                                │
│  └─ JwtStrategy.validate()                                   │
│      ├─ 1. Token 추출 및 검증                                 │
│      ├─ 2. Payload에서 userId 추출                           │
│      ├─ 3. User 조회 및 검증                                  │
│      └─ 4. Request.user에 주입                                │
└──────────────────────────────────────────────────────────────┘
```

---

## HOT 게시물 계산 흐름

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │ GET /api/community/posts/hot?buildingId={id}
         ▼
┌──────────────────────────────────────────────────────────────┐
│  CommunityService.getHotPosts()                              │
│  └─ HotPostService.getHotPosts(buildingId, 10)              │
│      ├─ 1. updateHotScores(buildingId) 호출                  │
│      │   ├─ 최근 24시간 게시물 조회                          │
│      │   ├─ 각 게시물 점수 계산                              │
│      │   │   score = (댓글*2 + 공감*1 + 조회*0.1) * 시간가중치│
│      │   └─ isHot 플래그 업데이트 (score > 10)              │
│      │                                                        │
│      └─ 2. HOT 게시물 조회 및 반환                           │
│          └─ ORDER BY hotScore DESC, createdAt DESC LIMIT 10 │
└──────────────────────────────────────────────────────────────┘
```

---

## 에러 처리 흐름

```
┌─────────────────┐
│  Any Layer      │
│  throw new      │
│  HttpException  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  HttpExceptionFilter (Global)                                │
│  ├─ 예외 catch                                                │
│  ├─ 상태 코드 추출                                            │
│  ├─ 에러 메시지 포맷팅                                         │
│  └─ JSON 응답 생성                                            │
│      {                                                        │
│        "statusCode": 400,                                    │
│        "timestamp": "2026-02-10T...",                        │
│        "path": "/api/community/posts",                       │
│        "message": "에러 메시지"                               │
│      }                                                        │
└────────────────────┬─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Client App    │
│  Error Handling │
└─────────────────┘
```

---

## 디렉토리별 역할

| 디렉토리 | 역할 | Nest 의존성 | 설명 |
|---------|------|------------|------|
| `apps/api/src/*/controller.ts` | Presentation | ✅ | HTTP 요청 수신, DTO 검증 |
| `apps/api/src/*/service.ts` | Orchestration | ✅ | DTO→Command 변환, UseCase 호출 |
| `apps/api/src/*/module.ts` | DI Container | ✅ | Port→Adapter 바인딩 |
| `libs/application/*/usecases/` | Business Logic | ❌ | UseCase 실행 (순수 TS) |
| `libs/domain/*/models/` | Domain Model | ❌ | 순수 도메인 클래스 |
| `libs/domain/*/ports/` | Interface | ❌ | Port 인터페이스 정의 |
| `libs/infrastructure/*/adapters/` | Adapter | ✅ | Port 구현체 (Nest 사용) |
| `libs/infrastructure/*/persistence/` | ORM Entity | ✅ | TypeORM 엔티티 |

---

## 의존성 방향

```
apps/api (Controller, Service, Module)
    ↓ calls
libs/application (UseCase)
    ↓ depends on
libs/domain (Models, Ports)
    ↑ implements
libs/infrastructure (Adapters)
```

### 규칙
- ✅ `apps/api` → `libs/application` → `libs/domain`
- ✅ `libs/infrastructure` → `libs/domain` (implements)
- ❌ `libs/domain` → `libs/application`
- ❌ `libs/domain` → `libs/infrastructure`
- ❌ `libs/application` → `@nestjs/*`

---

## 핵심 메시지

> **이 프로젝트는 NestJS 기반 MA이며,  
> 교체 가능성이 있는 영역에만 라이트 헥사고날을 적용합니다.**  
> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

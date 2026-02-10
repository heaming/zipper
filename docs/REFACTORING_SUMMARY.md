# ZIPPER 백엔드 리팩토링 완료 요약

## 📋 리팩토링 목표

**NestJS 기반 MA + 라이트 헥사고날 아키텍처 적용**

> 이 프로젝트는 NestJS 기반 Monolithic Architecture이며,  
> 교체 가능성이 있는 영역에만 라이트 헥사고날을 적용합니다.  
> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

---

## ✅ 완료된 작업

### 1. 디렉토리 구조 재구성

```
backend/
├── apps/api/              # NestJS Application (Nest 사용 ✅)
├── libs/domain/           # 순수 도메인 (Nest 의존성 ❌)
├── libs/application/      # UseCase 계층 (Nest 의존성 ❌)
└── libs/infrastructure/   # Adapter 구현 (Nest 사용 ✅)
```

### 2. Domain Layer 생성

**순수 TypeScript, Nest 의존성 금지 ❌**

생성된 파일:
- `libs/domain/auth/models/` - User, AuthUser
- `libs/domain/auth/ports/` - Authenticator, UserRepository, PasswordHasher
- `libs/domain/building/models/` - Building
- `libs/domain/community/models/` - Post
- `libs/domain/chat/models/` - ChatRoom
- `libs/domain/notification/ports/` - Notifier

### 3. Application Layer 생성

**순수 TypeScript, Nest 의존성 금지 ❌**

생성된 파일:
- `libs/application/auth/usecases/` - LoginUseCase, SignupUseCase, AuthorizeUserUseCase
- `libs/application/auth/commands/` - LoginCommand
- `libs/application/community/usecases/` - CreatePostUseCase, GetHotPostsUseCase
- `libs/application/community/commands/` - CreatePostCommand
- `libs/application/notification/usecases/` - SendNotificationUseCase

### 4. Infrastructure Layer 생성

**Nest 사용 가능 ✅ (@Injectable, TypeORM 등)**

생성된 파일:
- `libs/infrastructure/auth/adapters/` - JwtAuthenticatorAdapter, BcryptPasswordHasherAdapter
- `libs/infrastructure/auth/repositories/` - TypeOrmUserRepository
- `libs/infrastructure/auth/persistence/` - UserEntity (TypeORM)
- `libs/infrastructure/auth/strategies/` - JwtStrategy
- `libs/infrastructure/community/repositories/` - TypeOrmPostRepository
- `libs/infrastructure/community/persistence/` - PostEntity (TypeORM)
- `libs/infrastructure/notification/adapters/` - InMemoryNotifierAdapter
- `libs/infrastructure/database/` - DatabaseModule
- `libs/infrastructure/cache/` - RedisModule

### 5. API Layer 구성

**NestJS Application, Nest 자유롭게 사용 ✅**

생성된 파일:
- `apps/api/src/auth/` - AuthController, AuthService, AuthModule
- `apps/api/src/common/guards/` - JwtAuthGuard
- `apps/api/src/common/decorators/` - Public, CurrentUser
- `apps/api/src/common/filters/` - HttpExceptionFilter
- `apps/api/src/common/utils/` - invite-code.util
- `apps/api/src/app.module.ts` - 루트 모듈
- `apps/api/src/main.ts` - 애플리케이션 엔트리 포인트

### 6. 설정 파일 업데이트

- `nest-cli.json` - sourceRoot를 `apps/api/src`로 변경
- `tsconfig.json` - paths 별칭 추가 (`@domain/*`, `@application/*`, `@infrastructure/*`)
- `package.json` - scripts 및 jest 설정 업데이트
- `Dockerfile` - 빌드 경로 수정 (`dist/apps/api/src/main`)

### 7. 문서 업데이트

생성/수정된 문서:
- `docs/ARCHITECTURE.md` - **신규 생성** ⭐️
- `docs/API_FLOW.md` - 새 아키텍처에 맞게 전면 수정
- `docs/REFACTORING_SUMMARY.md` - **신규 생성** (본 문서)
- `README.md` - 프로젝트 구조 및 아키텍처 섹션 업데이트

---

## 🎯 핵심 원칙

### 의존성 방향

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

✅ **허용되는 의존성**
- `apps/api` → `libs/application` → `libs/domain`
- `libs/infrastructure` → `libs/domain` (implements Port)

❌ **금지되는 의존성**
- `libs/domain` → `libs/application`
- `libs/domain` → `libs/infrastructure`
- `libs/application` → `@nestjs/*`
- `libs/domain` → `@nestjs/*`

### Service 역할 제한

Service는 아래만 수행:
- ✅ DTO → Command 변환
- ✅ UseCase orchestration
- ✅ 트랜잭션 시작/종료

Service에서 금지:
- ❌ 정책 판단
- ❌ 권한 결정
- ❌ 도메인 규칙 계산

---

## 🔄 헥사고날 적용 범위

### 반드시 Port / Adapter로 분리

✅ **교체 가능성이 있는 영역**
- 인증 / 인가 (Authenticator Port)
- 알림 (Notifier Port: FCM, APNs 등)
- 외부 API 연동
- 저장소 접근 (Repository Port)

### 분리하지 말 것 (Nest Service 유지)

❌ **비즈니스 로직 영역**
- 게시판 비즈니스 규칙
- HOT 게시물 계산
- 커뮤니티 정책 로직

---

## 🚀 다음 단계

### 단기 (MVP 완성)
1. Community, Chat, Building, Notification 모듈 완성
2. 각 모듈에 대한 UseCase 구현
3. 각 모듈에 대한 Repository Adapter 구현
4. API 엔드포인트 완성

### 중기 (개선)
1. 통합 테스트 작성
2. E2E 테스트 작성
3. Repository 인터페이스 단위 테스트

### 장기 (확장)
1. 알림 시스템 실제 구현 (FCM/APNs)
2. 이벤트 기반 아키텍처 도입 (필요시)
3. MSA 분리 준비 (Domain Boundary 명확화)

---

## 📚 참고 문서

필수 읽기:
- [아키텍처 가이드](./ARCHITECTURE.md) ⭐️ **필독**
- [API 요청 흐름도](./API_FLOW.md)

기타:
- [API 명세서](./API_SPEC.md)
- [ERD 설계](./ERD.md)
- [WebSocket 명세](./WEBSOCKET_SPEC.md)
- [HOT 게시물 로직](./HOT_POST_LOGIC.md)

---

## 💡 핵심 메시지

> **이 프로젝트는 NestJS 기반 MA이며,  
> 교체 가능성이 있는 영역에만 라이트 헥사고날을 적용합니다.**  
> 
> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

---

**리팩토링 완료일**: 2026-02-10

# ZIPPER 아키텍처 가이드

## 아키텍처 원칙

### 핵심 철학
> **NestJS 기반 MA + 라이트 헥사고날**
> 
> 이 프로젝트는 **NestJS 기반 Monolithic Architecture**이며,  
> **교체 가능성이 있는 영역에만 라이트 헥사고날**을 적용합니다.  
> 헥사고날은 구조를 위한 것이지, **Nest를 버리기 위한 것이 아닙니다**.

---

## 디렉토리 구조

```
backend/
├── apps/
│   └── api/              # NestJS Application (Nest 사용 ✅)
│       ├── src/
│       │   ├── auth/          # Controller, Service, Module
│       │   ├── community/     # Controller, Service, Module
│       │   ├── chat/          # Gateway, Service, Module
│       │   ├── common/        # Guards, Filters, Decorators
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── test/
│
├── libs/
│   ├── domain/           # 순수 도메인 (Nest 의존성 ❌)
│   │   ├── auth/
│   │   │   ├── models/       # User, AuthUser (순수 TypeScript 클래스)
│   │   │   └── ports/        # Authenticator, UserRepository (인터페이스)
│   │   ├── building/
│   │   ├── community/
│   │   └── chat/
│   │
│   ├── application/      # UseCase 계층 (Nest 의존성 ❌)
│   │   ├── auth/
│   │   │   ├── commands/     # LoginCommand, SignupCommand
│   │   │   └── usecases/     # LoginUseCase, SignupUseCase
│   │   ├── community/
│   │   └── chat/
│   │
│   └── infrastructure/   # Adapter 구현 (Nest 사용 ✅)
│       ├── auth/
│       │   ├── adapters/     # JwtAuthenticatorAdapter
│       │   ├── repositories/ # TypeOrmUserRepository
│       │   └── persistence/  # UserEntity (TypeORM)
│       ├── community/
│       └── notification/
│
└── package.json
```

---

## 레이어별 역할

### 1. Domain Layer (libs/domain)
**순수 TypeScript, Nest 의존성 금지 ❌**

#### 역할
- 핵심 비즈니스 모델 정의
- Port 인터페이스 정의

#### 포함 요소
- **Models**: 순수 도메인 클래스
- **Ports**: 인터페이스 (Repository, Authenticator, Notifier 등)
- **Enums**, **Value Objects**

#### 예시
```typescript
// libs/domain/auth/models/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public password: string,
  ) {}

  updatePassword(newPassword: string): void {
    this.password = newPassword;
  }
}
```

```typescript
// libs/domain/auth/ports/authenticator.port.ts
export interface Authenticator {
  verify(token: string): Promise<AuthUser>;
  generateToken(user: AuthUser): Promise<{ accessToken: string }>;
}

export const AUTHENTICATOR = Symbol('AUTHENTICATOR');
```

---

### 2. Application Layer (libs/application)
**순수 TypeScript, Nest 의존성 금지 ❌**

#### 역할
- UseCase (비즈니스 로직 실행)
- Command/Query DTO
- Port에만 의존

#### 예시
```typescript
// libs/application/auth/usecases/login.usecase.ts
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authenticator: Authenticator,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.userRepository.findByEmail(command.email);
    // ...비즈니스 로직
    return this.authenticator.generateToken(authUser);
  }
}
```

---

### 3. Infrastructure Layer (libs/infrastructure)
**Nest 사용 가능 ✅ (@Injectable, TypeORM 등)**

#### 역할
- Port 인터페이스 구현 (Adapter)
- TypeORM Entity
- 외부 라이브러리 연동

#### 예시
```typescript
// libs/infrastructure/auth/adapters/jwt-authenticator.adapter.ts
@Injectable()
export class JwtAuthenticatorAdapter implements Authenticator {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token: string): Promise<AuthUser> {
    const payload = this.jwtService.verify(token);
    return new AuthUser(payload.sub, payload.email);
  }
}
```

```typescript
// libs/infrastructure/auth/persistence/user.entity.ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;
}
```

---

### 4. API Layer (apps/api)
**NestJS Application, Nest 자유롭게 사용 ✅**

#### 역할
- HTTP 요청 처리 (Controller)
- DTO → Command 변환 (Service)
- UseCase 호출 (Service)
- 트랜잭션 관리 (Service)
- DI 조립 (Module)

#### Service 역할 제한 ⚠️
Service는 아래만 수행:
- ✅ DTO → Command 변환
- ✅ UseCase orchestration
- ✅ 트랜잭션 시작/종료

Service에서 금지:
- ❌ 정책 판단
- ❌ 권한 결정
- ❌ 도메인 규칙 계산

#### 예시
```typescript
// apps/api/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async login(dto: LoginDto) {
    // DTO → Command 변환
    const command = new LoginCommand(dto.email, dto.password);
    
    // UseCase 실행
    return this.loginUseCase.execute(command);
  }
}
```

```typescript
// apps/api/src/auth/auth.module.ts
@Module({
  providers: [
    // Port → Adapter 바인딩
    {
      provide: AUTHENTICATOR,
      useClass: JwtAuthenticatorAdapter,
    },
    // UseCase 등록
    {
      provide: LoginUseCase,
      useFactory: (userRepo, passwordHasher, authenticator) => {
        return new LoginUseCase(userRepo, passwordHasher, authenticator);
      },
      inject: [USER_REPOSITORY, PASSWORD_HASHER, AUTHENTICATOR],
    },
  ],
})
export class AuthModule {}
```

---

## 의존성 방향

```
apps/api (Controller, Service, Module)
    ↓
libs/application (UseCase)
    ↓
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

## 헥사고날 적용 범위

### 반드시 Port / Adapter로 분리
- ✅ 인증 / 인가 (Authenticator)
- ✅ 알림 (Notifier: FCM, APNs)
- ✅ 외부 API 연동
- ✅ 저장소 접근 (Repository)

### 분리하지 말 것 (Nest Service 유지)
- ❌ 게시판 비즈니스 규칙
- ❌ HOT 게시물 계산
- ❌ 커뮤니티 정책 로직

---

## 교체 시나리오

### 인증 시스템 교체 예시
1. `JwtAuthenticatorAdapter` 제거
2. `SpringSecurityAuthenticatorAdapter` 추가
3. Module에서 Provider 교체
4. **Domain / Application 수정 불필요**

```typescript
// Before
{
  provide: AUTHENTICATOR,
  useClass: JwtAuthenticatorAdapter,
}

// After
{
  provide: AUTHENTICATOR,
  useClass: SpringSecurityAuthenticatorAdapter,
}
```

---

## 핵심 메시지

> **이 프로젝트는 NestJS 기반 MA이며,  
> 교체 가능성이 있는 영역에만 라이트 헥사고날을 적용합니다.**  
> 헥사고날은 구조를 위한 것이지, Nest를 버리기 위한 것이 아닙니다.

# 🚀 빠른 시작 가이드

## 현재 상태 ✅

- ✅ PostgreSQL 실행 중 (localhost:5432)
- ✅ Redis 실행 중 (localhost:6379)
- ✅ 환경 변수 파일 생성됨 (`.env.local`, `.env.example`)
- ✅ 의존성 설치 완료

## 로컬에서 백엔드 실행하기

### 1. 터미널에서 직접 실행 (권장)

```bash
cd /Users/hey._.mi/zipper/backend
npm run start:dev
```

서버가 정상적으로 시작되면:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

### 2. API 테스트

서버가 실행되면 http://localhost:3000 에서 API를 사용할 수 있습니다.

```bash
# Health Check (추후 구현)
curl http://localhost:3000/health

# 회원가입 예시
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "01012345678"
  }'

# 로그인 예시
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Docker 명령어

### DB/Redis 관리

```bash
# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f postgres
docker-compose logs -f redis

# 재시작
docker-compose restart postgres redis

# 중지
docker-compose stop postgres redis

# 중지 및 삭제
docker-compose down

# 데이터까지 삭제 (주의!)
docker-compose down -v
```

### DB 직접 접속

```bash
# PostgreSQL 접속
docker exec -it zipper-postgres psql -U zpdbdu -d zipper_dev

# 테이블 목록 확인
\dt

# 종료
\q
```

### Redis 접속

```bash
# Redis CLI
docker exec -it zipper-redis redis-cli

# 키 확인
KEYS *

# 종료
exit
```

## 환경 변수 설정

현재 `.env.local` 파일이 생성되어 있습니다:

```bash
# 파일 내용 확인
cat .env.local

# 필요시 수정
nano .env.local
# 또는
code .env.local
```

### 주요 설정 값

- `DB_HOST=localhost` - 로컬 개발용
- `DB_PORT=5432`
- `DB_USERNAME=zpdbdu`
- `DB_PASSWORD=heymi1i`
- `DB_NAME=zipper_dev`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `JWT_SECRET=your-secret-key-change-in-production` ⚠️ 프로덕션에서는 변경 필수
- `NODE_ENV=development`
- `PORT=3000`

## 문제 해결

### 1. 포트 충돌

```bash
# 포트 사용 확인
lsof -i :3000  # 백엔드
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 프로세스 종료
kill -9 <PID>
```

### 2. DB 연결 실패

```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# PostgreSQL 상태 확인
docker exec zipper-postgres pg_isready -U zpdbdu

# 로그 확인
docker-compose logs postgres
```

### 3. Redis 연결 실패

```bash
# Redis 상태 확인
docker exec zipper-redis redis-cli ping
# 응답: PONG (정상)

# 로그 확인
docker-compose logs redis
```

### 4. 의존성 문제

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 5. TypeScript 컴파일 에러

```bash
# 빌드 확인
npm run build

# dist 폴더 삭제 후 재빌드
rm -rf dist
npm run build
```

## 개발 팁

### Hot Reload
`npm run start:dev` 사용 시 파일 변경이 자동으로 감지되어 서버가 재시작됩니다.

### 디버깅
```bash
npm run start:debug
```

VSCode에서 디버거 연결 가능 (포트: 9229)

### 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

### 테스트
```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:cov
```

## 다음 단계

1. ✅ 백엔드 서버 실행
2. 📝 API 엔드포인트 테스트
3. 🗄️ TypeORM Migration 설정
4. 🧪 테스트 코드 작성
5. 📱 프론트엔드 연동

---

**문제가 있으면 `LOCAL_SETUP.md`를 참고하세요!**

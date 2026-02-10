# 로컬 개발 환경 설정

## 1. 사전 준비

- Node.js (v18 이상)
- Docker & Docker Compose
- npm 또는 yarn

## 2. 환경 설정

### 2.1 의존성 설치
```bash
cd backend
npm install
```

### 2.2 환경 변수 설정
`.env.local` 파일이 이미 생성되어 있습니다.

```bash
# 파일 확인
cat .env.local
```

필요시 설정 값을 수정하세요:
- `JWT_SECRET`: 프로덕션에서는 반드시 변경
- `DB_PASSWORD`: 보안을 위해 변경 권장

## 3. 데이터베이스 & Redis 실행

### 방법 1: Docker Compose로 DB와 Redis만 실행 (권장)

```bash
# 프로젝트 루트에서
cd ..
docker-compose up -d postgres redis
```

### 방법 2: 전체 스택 실행 (백엔드 앱도 Docker에서)

```bash
# 프로젝트 루트에서
cd ..
docker-compose up -d
```

### DB/Redis 상태 확인

```bash
docker-compose ps
```

## 4. 로컬에서 백엔드 실행

### 개발 모드 (Hot Reload)

```bash
cd backend
npm run start:dev
```

### 프로덕션 빌드

```bash
cd backend
npm run build
npm run start:prod
```

## 5. 서버 확인

서버가 실행되면:
- **백엔드 API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 6. 종료

### 백엔드만 종료
`Ctrl + C` (터미널에서)

### Docker 컨테이너 종료
```bash
# 프로젝트 루트에서
docker-compose down
```

### 데이터도 함께 삭제 (주의!)
```bash
docker-compose down -v
```

## 7. 자주 사용하는 명령어

```bash
# DB 접속
docker exec -it zipper-postgres psql -U zpdbdu -d zipper_dev

# Redis CLI 접속
docker exec -it zipper-redis redis-cli

# 로그 확인
docker-compose logs -f postgres
docker-compose logs -f redis

# 컨테이너 재시작
docker-compose restart postgres
docker-compose restart redis
```

## 8. 문제 해결

### 포트 충돌
이미 5432 또는 6379 포트가 사용 중인 경우:

```bash
# 사용 중인 포트 확인 (macOS)
lsof -i :5432
lsof -i :6379

# 프로세스 종료
kill -9 <PID>
```

또는 `docker-compose.yml`에서 포트를 변경:
```yaml
ports:
  - "5433:5432"  # 5432 대신 5433 사용
```

### DB 연결 실패
1. Docker 컨테이너가 실행 중인지 확인
2. `.env.local` 파일의 설정이 올바른지 확인
3. healthcheck가 통과했는지 확인: `docker-compose ps`

### Redis 연결 실패
```bash
# Redis 상태 확인
docker exec -it zipper-redis redis-cli ping
# PONG 응답이 와야 정상
```

## 9. TypeORM Migration (추후)

```bash
# Migration 생성
npm run typeorm migration:generate -- -n MigrationName

# Migration 실행
npm run typeorm migration:run

# Migration 되돌리기
npm run typeorm migration:revert
```

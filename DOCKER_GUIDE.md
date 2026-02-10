# 🐳 Docker 실행 가이드

ZIPPER 프로젝트를 Docker로 실행하는 방법

## 📋 목차

- [빠른 시작](#빠른-시작)
- [개별 서비스 실행](#개별-서비스-실행)
- [로컬 개발 vs Docker](#로컬-개발-vs-docker)
- [Docker 명령어 모음](#docker-명령어-모음)
- [문제 해결](#문제-해결)

## 🚀 빠른 시작

### 전체 스택 실행 (권장)

```bash
# 모든 서비스 실행 (DB, Redis, Backend, Frontend)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

실행 후:
- **프론트엔드**: http://localhost:3001
- **백엔드 API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 전체 스택 중지

```bash
# 중지 (컨테이너는 유지)
docker-compose stop

# 중지 및 삭제
docker-compose down

# 중지, 삭제, 볼륨까지 삭제 (⚠️ 데이터 손실)
docker-compose down -v
```

## 🎯 개별 서비스 실행

### 1. DB와 Redis만 실행 (로컬 개발 권장)

```bash
# PostgreSQL + Redis만 실행
docker-compose up -d postgres redis

# 백엔드는 로컬에서
cd backend
npm run start:dev

# 프론트엔드도 로컬에서
cd client
npm run dev
```

**장점**:
- ✅ Hot Reload 가능
- ✅ 빠른 개발 사이클
- ✅ 디버깅 용이
- ✅ 코드 변경 시 재빌드 불필요

### 2. 백엔드만 Docker로

```bash
# DB, Redis, Backend만 실행
docker-compose up -d postgres redis backend

# 프론트엔드는 로컬에서
cd client
npm run dev
```

### 3. 프론트엔드만 Docker로

```bash
# DB, Redis만 실행
docker-compose up -d postgres redis

# 백엔드는 로컬에서
cd backend
npm run start:dev

# 프론트엔드는 Docker로
docker-compose up -d frontend
```

### 4. 전체 Docker (배포 시뮬레이션)

```bash
docker-compose up -d
```

## 🔄 로컬 개발 vs Docker

### 로컬 개발 (권장)

```bash
# 1. DB와 Redis만 Docker로
docker-compose up -d postgres redis

# 2. 백엔드 (터미널 1)
cd backend
npm run start:dev

# 3. 프론트엔드 (터미널 2)
cd client
npm run dev
```

**장점**:
- Hot Reload 즉시 반영
- 디버깅 용이
- 빠른 개발 속도

### Docker 개발

```bash
docker-compose up -d
```

**장점**:
- 프로덕션 환경과 유사
- 환경 통일
- 배포 전 테스트 용이

**단점**:
- 코드 변경 시 재빌드 필요
- 빌드 시간 소요
- 디버깅 어려움

## 📦 서비스 구성

```yaml
services:
  postgres:      # PostgreSQL 15
    - Port: 5432
    - DB: zipper_dev
    - User: zpdbdu
    
  redis:         # Redis 7
    - Port: 6379
    
  backend:       # NestJS
    - Port: 3000
    - 의존: postgres, redis
    
  frontend:      # Next.js 14
    - Port: 3001
    - 의존: backend
```

## 🛠 Docker 명령어 모음

### 상태 확인

```bash
# 실행 중인 컨테이너
docker-compose ps

# 리소스 사용량
docker stats

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f postgres  # 실시간
```

### 서비스 제어

```bash
# 특정 서비스만 시작
docker-compose up -d backend

# 특정 서비스만 재시작
docker-compose restart backend

# 특정 서비스만 중지
docker-compose stop frontend

# 특정 서비스만 재빌드
docker-compose build --no-cache backend
docker-compose up -d backend
```

### 컨테이너 접속

```bash
# 백엔드 컨테이너 쉘
docker exec -it zipper-backend sh

# PostgreSQL 접속
docker exec -it zipper-postgres psql -U zpdbdu -d zipper_dev

# Redis CLI
docker exec -it zipper-redis redis-cli

# 프론트엔드 컨테이너
docker exec -it zipper-frontend sh
```

### 데이터베이스 작업

```bash
# DB 백업
docker exec zipper-postgres pg_dump -U zpdbdu zipper_dev > backup.sql

# DB 복원
cat backup.sql | docker exec -i zipper-postgres psql -U zpdbdu -d zipper_dev

# DB 초기화 (⚠️ 데이터 손실)
docker-compose down -v
docker-compose up -d postgres
```

### 정리

```bash
# 중지된 컨테이너 삭제
docker-compose rm

# 사용하지 않는 이미지 삭제
docker image prune

# 전체 정리 (⚠️ 주의)
docker system prune -a
```

## 🔧 환경 변수

### Backend (.env)

```env
DB_HOST=postgres          # Docker 내부에서는 서비스명
DB_PORT=5432
DB_USERNAME=zpdbdu
DB_PASSWORD=heymi1i
DB_NAME=zipper_dev
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3001
```

## 🐛 문제 해결

### 1. 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 프로세스 종료
kill -9 <PID>

# 또는 docker-compose.yml에서 포트 변경
ports:
  - "3002:3000"  # 호스트:컨테이너
```

### 2. 빌드 실패

```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 특정 서비스만
docker-compose build --no-cache backend

# 이미지 삭제 후 재빌드
docker-compose down --rmi all
docker-compose up -d --build
```

### 3. DB 연결 실패

```bash
# DB 상태 확인
docker-compose ps postgres

# healthcheck 확인
docker inspect zipper-postgres | grep -A 5 Health

# 로그 확인
docker-compose logs postgres

# DB 재시작
docker-compose restart postgres
```

### 4. 컨테이너 멈춤

```bash
# 로그 확인
docker-compose logs <service-name>

# 재시작
docker-compose restart <service-name>

# 강제 재생성
docker-compose up -d --force-recreate <service-name>
```

### 5. 디스크 공간 부족

```bash
# 사용량 확인
docker system df

# 정리
docker system prune -a
docker volume prune
```

## 📊 모니터링

### 실시간 로그 확인

```bash
# 모든 서비스
docker-compose logs -f

# 특정 서비스
docker-compose logs -f backend frontend

# 마지막 100줄
docker-compose logs --tail=100 backend
```

### 리소스 사용량

```bash
# 실시간 모니터링
docker stats

# 특정 컨테이너만
docker stats zipper-backend zipper-frontend
```

## 🚢 배포 시뮬레이션

로컬에서 프로덕션 환경을 시뮬레이션:

```bash
# 1. 모든 서비스 빌드
docker-compose build

# 2. 프로덕션 모드로 실행
docker-compose up -d

# 3. 헬스 체크
curl http://localhost:3000/health
curl http://localhost:3001

# 4. 로그 모니터링
docker-compose logs -f
```

## 📝 개발 워크플로우 예시

### 하루 시작

```bash
# 1. DB와 Redis 실행
docker-compose up -d postgres redis

# 2. 백엔드 개발 모드
cd backend
npm run start:dev

# 3. 프론트엔드 개발 모드
cd client
npm run dev
```

### 하루 종료

```bash
# 백엔드/프론트엔드는 Ctrl+C로 종료

# Docker 서비스 중지 (선택)
docker-compose stop

# 또는 실행 유지 (다음 날 바로 시작 가능)
```

### 기능 테스트

```bash
# 전체 스택 Docker로 실행
docker-compose up -d

# 테스트 후 중지
docker-compose down
```

---

**💡 Tip**: 대부분의 개발 작업은 "DB/Redis만 Docker, 나머지는 로컬" 방식이 가장 효율적입니다!

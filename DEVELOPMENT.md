# 개발 가이드 (Development Guide)

## 목차
1. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
2. [Docker 개발 환경](#docker-개발-환경)
3. [파일 수정 시 반영 방법](#파일-수정-시-반영-방법)
4. [Docker 재실행 방법](#docker-재실행-방법)

---

## 로컬 개발 환경 설정

### Backend (NestJS)

```bash
# 1. 경로 이동
cd /Users/hey._.mi/zipper/backend

# 2. 패키지 설치 (처음 한 번만)
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 설정

# 4. 개발 서버 실행
npm run start:dev
```

- **실행 포트**: `http://localhost:3000`
- **Hot-reload**: ✅ 파일 수정 시 자동 재시작
- **장점**: 빠른 개발, 실시간 디버깅

### Frontend (Next.js)

```bash
# 1. 경로 이동
cd /Users/hey._.mi/zipper/client/apps/webview

# 2. 패키지 설치 (처음 한 번만)
npm install

# 3. 환경 변수 설정
cd /Users/hey._.mi/zipper/client
cp .env.example .env.local
# .env.local 파일 편집하여 설정

# 4. 개발 서버 실행
cd apps/webview
npm run dev
```

- **실행 포트**: `http://localhost:3001`
- **Hot-reload**: ✅ 파일 수정 시 자동 새로고침
- **장점**: 빠른 피드백, 실시간 UI 업데이트

---

## Docker 개발 환경

### 전체 서비스 실행

```bash
# 전체 서비스 시작 (postgres, redis, backend, frontend)
cd /Users/hey._.mi/zipper
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 개별 서비스 실행

```bash
# 데이터베이스만 실행 (개발 시 유용)
docker-compose up -d postgres redis

# 백엔드만 실행
docker-compose up -d backend

# 프론트엔드만 실행
docker-compose up -d frontend
```

---

## 파일 수정 시 반영 방법

### ❓ 파일 수정하면 Docker가 자동으로 재빌드되나요?

**❌ 아니요, 자동으로 재빌드되지 않습니다.**

현재 Docker 설정은 **프로덕션 모드**입니다:
- 파일 수정 시 Docker 이미지를 **수동으로 재빌드**해야 합니다
- Hot-reload(핫 리로드)가 **작동하지 않습니다**
- 빌드된 파일이 컨테이너에 복사되어 실행됩니다

### 📋 개발 모드별 비교

| 항목 | 로컬 개발 | Docker |
|------|----------|--------|
| **파일 수정 반영** | 자동 (Hot-reload) | 수동 (재빌드 필요) |
| **재시작 속도** | 빠름 (수초) | 느림 (수분) |
| **디버깅** | 쉬움 | 어려움 |
| **환경 일치성** | 낮음 | 높음 (프로덕션과 동일) |
| **추천 시기** | 개발 중 | 배포 전 테스트 |

### ✅ 권장 개발 방법

```bash
# 1. 데이터베이스만 Docker로 실행
docker-compose up -d postgres redis

# 2. Backend는 로컬에서 실행
cd backend
npm run start:dev

# 3. Frontend도 로컬에서 실행
cd client/apps/webview
npm run dev
```

이렇게 하면:
- ✅ 파일 수정 시 즉시 반영
- ✅ 빠른 개발 속도
- ✅ 실시간 디버깅 가능
- ✅ 데이터베이스는 Docker로 격리

---

## Docker 재실행 방법

### 1. 전체 재시작

```bash
cd /Users/hey._.mi/zipper

# 방법 1: 전체 중지 후 재시작
docker-compose down
docker-compose up -d

# 방법 2: 재시작만
docker-compose restart
```

### 2. 특정 서비스만 재시작

```bash
# Backend만 재시작
docker-compose restart backend

# Frontend만 재시작
docker-compose restart frontend

# PostgreSQL, Redis 재시작
docker-compose restart postgres redis
```

### 3. 코드 수정 후 재빌드

```bash
# Backend 재빌드 + 재실행
docker-compose up -d --build backend

# Frontend 재빌드 + 재실행
docker-compose up -d --build frontend

# 전체 재빌드 + 재실행
docker-compose up -d --build
```

### 4. 서비스 중지

```bash
# 전체 중지 (컨테이너 삭제)
docker-compose down

# 전체 중지 + 볼륨 삭제 (데이터 초기화)
docker-compose down -v

# 특정 서비스만 중지
docker-compose stop backend
docker-compose stop frontend
```

### 5. 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 또는
docker ps

# 로그 확인
docker-compose logs backend
docker-compose logs frontend

# 실시간 로그 확인 (-f: follow)
docker-compose logs -f backend
```

---

## 개발 워크플로우 예시

### 시나리오 1: 일반적인 개발 작업

```bash
# 1. 데이터베이스 시작
docker-compose up -d postgres redis

# 2. Backend 로컬 실행 (터미널 1)
cd backend
npm run start:dev

# 3. Frontend 로컬 실행 (터미널 2)
cd client/apps/webview
npm run dev

# 4. 코드 수정 → 자동 반영됨!
# Backend: 파일 저장 시 자동 재시작
# Frontend: 파일 저장 시 브라우저 자동 새로고침
```

### 시나리오 2: 프로덕션 환경 테스트

```bash
# 1. 전체 Docker로 빌드 및 실행
docker-compose up -d --build

# 2. 테스트

# 3. 종료
docker-compose down
```

### 시나리오 3: Backend만 수정할 때

```bash
# 1. Frontend는 Docker로 실행
docker-compose up -d postgres redis frontend

# 2. Backend만 로컬에서 개발
cd backend
npm run start:dev
```

---

## 문제 해결

### Docker 디스크 공간 부족

```bash
# Docker 정리 (사용하지 않는 이미지, 컨테이너, 볼륨 삭제)
docker system prune -a --volumes -f

# 디스크 사용량 확인
docker system df
```

### 포트 충돌

```bash
# 실행 중인 프로세스 확인
lsof -i :3000  # Backend 포트
lsof -i :3001  # Frontend 포트
lsof -i :5432  # PostgreSQL 포트

# 프로세스 종료
kill -9 <PID>
```

### 패키지 설치 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 환경별 포트 정리

| 서비스 | 로컬 포트 | Docker 포트 | 설명 |
|--------|----------|------------|------|
| Backend | 3000 | 3000 | NestJS API |
| Frontend | 3001 | 3001 | Next.js WebView |
| PostgreSQL | 5432 | 5432 | 데이터베이스 |
| Redis | 6379 | 6379 | 캐시/세션 |

---

## 참고 문서

- [Docker 가이드](./DOCKER_GUIDE.md) - 상세한 Docker 사용법
- [README](./README.md) - 프로젝트 개요
- [API 문서](./docs/API_FLOW.md) - API 흐름 가이드
- [ERD](./docs/ERD.md) - 데이터베이스 설계

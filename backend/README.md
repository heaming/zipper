# ZIPPER Backend

거주 인증 기반 건물 커뮤니티 앱 백엔드

## 기술 스택

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT

## 설치 및 실행

### 로컬 개발 환경

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일 수정
```

3. 데이터베이스 실행 (Docker)
```bash
cd ..
docker-compose up -d postgres redis
```

4. 애플리케이션 실행
```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod
```

## API 문서

API 명세서는 `../docs/API_SPEC.md`를 참고하세요.

## 주요 기능

- **인증**: JWT 기반 인증, 거주 인증 (GPS/초대 코드/사진)
- **건물 관리**: 건물 검색, 멤버십 관리
- **커뮤니티**: 게시판, 댓글, HOT 게시물 자동 계산
- **채팅**: 실시간 채팅 (WebSocket), 건물 전체 채팅방, 주제 채팅방
- **알림**: 댓글, 멘션, HOT 게시물 알림

## 라이선스

UNLICENSED

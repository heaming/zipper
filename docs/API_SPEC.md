# ZIPPER API 명세서

## 인증 방식
- JWT Bearer Token
- Header: `Authorization: Bearer {token}`
- WebView 환경: HttpOnly Cookie 또는 Secure Storage 사용

---

## 1. Auth API

### 1.1 회원가입
```
POST /api/auth/signup
Body: {
  email: string
  password: string
  phoneNumber?: string
}
Response: {
  userId: string
  message: string
}
```

### 1.2 로그인
```
POST /api/auth/login
Body: {
  email: string
  password: string
}
Response: {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    profile?: UserProfile
  }
}
```

### 1.3 토큰 갱신
```
POST /api/auth/refresh
Body: {
  refreshToken: string
}
Response: {
  accessToken: string
  refreshToken: string
}
```

### 1.4 거주 인증 - GPS 인증
```
POST /api/auth/verify-residence/gps
Headers: Authorization
Body: {
  buildingId: string
  latitude: number
  longitude: number
}
Response: {
  verificationId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
```

### 1.5 거주 인증 - 초대 코드
```
POST /api/auth/verify-residence/invite-code
Headers: Authorization
Body: {
  buildingId: string
  inviteCode: string
}
Response: {
  verificationId: string
  status: 'APPROVED'
  buildingMembership: BuildingMembership
}
```

### 1.6 거주 인증 - 사진 인증
```
POST /api/auth/verify-residence/photo
Headers: Authorization
Content-Type: multipart/form-data
Body: {
  buildingId: string
  photo: File
}
Response: {
  verificationId: string
  status: 'PENDING'
}
```

### 1.7 내 프로필 조회
```
GET /api/auth/profile
Headers: Authorization
Response: {
  id: string
  email: string
  profile: {
    nickname: string
    buildingId: string
    buildingName: string
    profileImageUrl?: string
  }
}
```

### 1.8 닉네임 설정/수정
```
PUT /api/auth/profile/nickname
Headers: Authorization
Body: {
  buildingId: string
  nickname: string
}
Response: {
  nickname: string
}
```

---

## 2. Building API

### 2.1 건물 검색 (주소/이름)
```
GET /api/buildings/search?q={query}
Response: {
  buildings: Array<{
    id: string
    name: string
    address: string
    buildingType: string
  }>
}
```

### 2.2 건물 상세 정보
```
GET /api/buildings/:id
Headers: Authorization (optional)
Response: {
  id: string
  name: string
  address: string
  addressDetail?: string
  buildingType: string
  totalUnits?: number
  memberCount: number
  isMember: boolean (인증된 사용자만)
}
```

### 2.3 내 건물 목록
```
GET /api/buildings/my
Headers: Authorization
Response: {
  buildings: Array<{
    id: string
    name: string
    address: string
    joinedAt: string
    nickname: string
  }>
}
```

---

## 3. Community API

### 3.1 게시글 목록 조회
```
GET /api/community/posts?buildingId={id}&boardType={type}&page={page}&limit={limit}
Headers: Authorization
Query:
  - buildingId: string (required)
  - boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE' (optional)
  - page: number (default: 1)
  - limit: number (default: 20)
Response: {
  posts: Array<{
    id: string
    title: string
    content: string
    imageUrls: string[]
    authorNickname: string
    boardType: string
    likeCount: number
    commentCount: number
    viewCount: number
    isHot: boolean
    createdAt: string
  }>
  total: number
  page: number
  limit: number
}
```

### 3.2 HOT 게시물 목록
```
GET /api/community/posts/hot?buildingId={id}
Headers: Authorization
Response: {
  posts: Array<Post> (최대 10개)
}
```

### 3.3 게시글 상세 조회
```
GET /api/community/posts/:id
Headers: Authorization
Response: {
  id: string
  title: string
  content: string
  imageUrls: string[]
  authorNickname: string
  boardType: string
  likeCount: number
  commentCount: number
  viewCount: number
  isLiked: boolean
  isHot: boolean
  createdAt: string
  updatedAt: string
}
```

### 3.4 게시글 작성
```
POST /api/community/posts
Headers: Authorization
Content-Type: multipart/form-data
Body: {
  buildingId: string
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  title: string
  content: string
  images?: File[]
}
Response: {
  id: string
  title: string
  createdAt: string
}
```

### 3.5 게시글 수정
```
PUT /api/community/posts/:id
Headers: Authorization
Body: {
  title?: string
  content?: string
  imageUrls?: string[]
}
Response: {
  id: string
  updatedAt: string
}
```

### 3.6 게시글 삭제
```
DELETE /api/community/posts/:id
Headers: Authorization
Response: {
  message: string
}
```

### 3.7 게시글 공감
```
POST /api/community/posts/:id/like
Headers: Authorization
Response: {
  isLiked: boolean
  likeCount: number
}
```

### 3.8 게시글 공감 취소
```
DELETE /api/community/posts/:id/like
Headers: Authorization
Response: {
  isLiked: boolean
  likeCount: number
}
```

### 3.9 댓글 목록 조회
```
GET /api/community/posts/:postId/comments?page={page}&limit={limit}
Headers: Authorization
Response: {
  comments: Array<{
    id: string
    content: string
    authorNickname: string
    parentCommentId?: string
    replies?: Comment[]
    likeCount: number
    isLiked: boolean
    createdAt: string
  }>
  total: number
}
```

### 3.10 댓글 작성
```
POST /api/community/posts/:postId/comments
Headers: Authorization
Body: {
  content: string
  parentCommentId?: string (대댓글인 경우)
}
Response: {
  id: string
  content: string
  createdAt: string
}
```

### 3.11 댓글 수정
```
PUT /api/community/comments/:id
Headers: Authorization
Body: {
  content: string
}
Response: {
  id: string
  updatedAt: string
}
```

### 3.12 댓글 삭제
```
DELETE /api/community/comments/:id
Headers: Authorization
Response: {
  message: string
}
```

### 3.13 댓글 공감
```
POST /api/community/comments/:id/like
Headers: Authorization
Response: {
  isLiked: boolean
  likeCount: number
}
```

---

## 4. Chat API

### 4.1 채팅방 목록 조회
```
GET /api/chat/rooms?buildingId={id}
Headers: Authorization
Response: {
  rooms: Array<{
    id: string
    roomType: 'BUILDING' | 'TOPIC'
    topicName?: string
    lastMessage?: {
      content: string
      senderNickname: string
      createdAt: string
    }
    unreadCount: number (MVP에서는 0)
    createdAt: string
  }>
}
```

### 4.2 채팅방 생성 (주제 채팅방)
```
POST /api/chat/rooms
Headers: Authorization
Body: {
  buildingId: string
  roomType: 'TOPIC'
  topicName: string
  postId?: string
}
Response: {
  id: string
  roomType: string
  topicName?: string
  createdAt: string
}
```

### 4.3 채팅방 입장
```
POST /api/chat/rooms/:roomId/join
Headers: Authorization
Response: {
  roomId: string
  joinedAt: string
}
```

### 4.4 메시지 목록 조회
```
GET /api/chat/rooms/:roomId/messages?before={timestamp}&limit={limit}
Headers: Authorization
Query:
  - before: timestamp (optional, 페이징용)
  - limit: number (default: 50)
Response: {
  messages: Array<{
    id: string
    content: string
    senderNickname: string
    messageType: string
    imageUrl?: string
    createdAt: string
  }>
  hasMore: boolean
}
```

### 4.5 메시지 전송 (REST - WebSocket 대체용)
```
POST /api/chat/rooms/:roomId/messages
Headers: Authorization
Body: {
  content: string
  messageType?: 'TEXT' | 'IMAGE'
  imageUrl?: string
}
Response: {
  id: string
  content: string
  createdAt: string
}
```

---

## 5. Notification API

### 5.1 알림 목록 조회
```
GET /api/notifications?page={page}&limit={limit}&isRead={boolean}
Headers: Authorization
Response: {
  notifications: Array<{
    id: string
    type: string
    title: string
    content: string
    relatedPostId?: string
    relatedCommentId?: string
    relatedChatRoomId?: string
    isRead: boolean
    createdAt: string
  }>
  total: number
  unreadCount: number
}
```

### 5.2 알림 읽음 처리
```
PUT /api/notifications/:id/read
Headers: Authorization
Response: {
  id: string
  isRead: boolean
}
```

### 5.3 알림 전체 읽음 처리
```
PUT /api/notifications/read-all
Headers: Authorization
Response: {
  message: string
  readCount: number
}
```

---

## 에러 응답 형식
```
{
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}
```

## 주요 HTTP 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스 없음
- 409: 충돌 (중복 등)
- 500: 서버 오류

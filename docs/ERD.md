# ZIPPER ERD 설계

## 도메인별 엔티티 관계도

### 1. Auth 도메인

#### User (사용자)
- id: UUID (PK)
- email: string (unique)
- password: string (hashed)
- phoneNumber: string (nullable)
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp (soft delete)

#### UserProfile (사용자 프로필)
- id: UUID (PK)
- userId: UUID (FK → User.id, unique)
- nickname: string (건물 단위 익명 닉네임)
- buildingId: UUID (FK → Building.id)
- profileImageUrl: string (nullable)
- createdAt: timestamp
- updatedAt: timestamp

#### ResidenceVerification (거주 인증)
- id: UUID (PK)
- userId: UUID (FK → User.id)
- buildingId: UUID (FK → Building.id)
- verificationType: enum ('GPS', 'INVITE_CODE', 'PHOTO')
- status: enum ('PENDING', 'APPROVED', 'REJECTED')
- gpsLatitude: decimal (nullable)
- gpsLongitude: decimal (nullable)
- inviteCode: string (nullable)
- verificationPhotoUrl: string (nullable)
- verifiedAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp

---

### 2. Building 도메인

#### Building (건물)
- id: UUID (PK)
- name: string
- address: string
- addressDetail: string (nullable)
- latitude: decimal
- longitude: decimal
- buildingType: enum ('APARTMENT', 'OFFICETEL', 'VILLA')
- totalUnits: integer (nullable)
- inviteCode: string (unique, 자동 생성)
- createdAt: timestamp
- updatedAt: timestamp

#### BuildingMembership (건물 멤버십)
- id: UUID (PK)
- userId: UUID (FK → User.id)
- buildingId: UUID (FK → Building.id)
- status: enum ('ACTIVE', 'INACTIVE')
- joinedAt: timestamp
- createdAt: timestamp
- updatedAt: timestamp
- unique constraint: (userId, buildingId)

---

### 3. Community 도메인

#### Post (게시글)
- id: UUID (PK)
- authorId: UUID (FK → User.id)
- buildingId: UUID (FK → Building.id)
- boardType: enum ('FREE', 'DELIVERY', 'LIFESTYLE')
- title: string
- content: text
- imageUrls: string[] (JSON array)
- likeCount: integer (default: 0)
- commentCount: integer (default: 0)
- viewCount: integer (default: 0)
- hotScore: decimal (default: 0, HOT 게시물 점수)
- isHot: boolean (default: false)
- hotCalculatedAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp (soft delete)
- index: (buildingId, boardType, createdAt)

#### PostLike (게시글 공감)
- id: UUID (PK)
- postId: UUID (FK → Post.id)
- userId: UUID (FK → User.id)
- createdAt: timestamp
- unique constraint: (postId, userId)

#### Comment (댓글)
- id: UUID (PK)
- postId: UUID (FK → Post.id)
- authorId: UUID (FK → User.id)
- parentCommentId: UUID (FK → Comment.id, nullable, 대댓글용)
- content: text
- likeCount: integer (default: 0)
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp (soft delete)
- index: (postId, createdAt)

#### CommentLike (댓글 공감)
- id: UUID (PK)
- commentId: UUID (FK → Comment.id)
- userId: UUID (FK → User.id)
- createdAt: timestamp
- unique constraint: (commentId, userId)

---

### 4. Chat 도메인

#### ChatRoom (채팅방)
- id: UUID (PK)
- buildingId: UUID (FK → Building.id)
- roomType: enum ('BUILDING', 'TOPIC')
- topicName: string (nullable, 주제 채팅방인 경우)
- postId: UUID (FK → Post.id, nullable, 게시글에서 파생된 경우)
- createdBy: UUID (FK → User.id)
- createdAt: timestamp
- updatedAt: timestamp

#### ChatMessage (채팅 메시지)
- id: UUID (PK)
- roomId: UUID (FK → ChatRoom.id)
- senderId: UUID (FK → User.id)
- content: text
- messageType: enum ('TEXT', 'IMAGE', 'SYSTEM')
- imageUrl: string (nullable)
- createdAt: timestamp
- index: (roomId, createdAt)

#### ChatRoomMember (채팅방 멤버)
- id: UUID (PK)
- roomId: UUID (FK → ChatRoom.id)
- userId: UUID (FK → User.id)
- joinedAt: timestamp
- lastReadAt: timestamp (nullable, 읽음 표시용이지만 MVP에서는 미사용)
- unique constraint: (roomId, userId)

---

### 5. Notification 도메인

#### Notification (알림)
- id: UUID (PK)
- userId: UUID (FK → User.id)
- type: enum ('COMMENT', 'REPLY', 'MENTION', 'HOT_POST', 'CHAT_MENTION')
- title: string
- content: text
- relatedPostId: UUID (FK → Post.id, nullable)
- relatedCommentId: UUID (FK → Comment.id, nullable)
- relatedChatRoomId: UUID (FK → ChatRoom.id, nullable)
- isRead: boolean (default: false)
- createdAt: timestamp
- index: (userId, isRead, createdAt)

---

## 관계 요약

```
User (1) ──< (N) UserProfile
User (1) ──< (N) ResidenceVerification
User (1) ──< (N) BuildingMembership
User (1) ──< (N) Post
User (1) ──< (N) Comment
User (1) ──< (N) ChatMessage
User (1) ──< (N) Notification

Building (1) ──< (N) BuildingMembership
Building (1) ──< (N) Post
Building (1) ──< (N) ChatRoom

Post (1) ──< (N) Comment
Post (1) ──< (N) PostLike
Post (1) ──< (1) ChatRoom (주제 채팅방)

ChatRoom (1) ──< (N) ChatMessage
ChatRoom (1) ──< (N) ChatRoomMember

Comment (1) ──< (N) Comment (self-reference, 대댓글)
```

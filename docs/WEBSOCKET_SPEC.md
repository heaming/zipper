# ZIPPER WebSocket 이벤트 명세

## 연결 설정
- Protocol: Socket.IO
- Namespace: `/chat`
- 인증: JWT Token을 쿼리 파라미터 또는 handshake auth로 전달

## 클라이언트 → 서버 이벤트

### 1. 채팅방 입장
```
Event: join-room
Payload: {
  roomId: string
}
Response: {
  success: boolean
  roomId: string
  message?: string
}
```

### 2. 채팅방 나가기
```
Event: leave-room
Payload: {
  roomId: string
}
Response: {
  success: boolean
  roomId: string
}
```

### 3. 메시지 전송
```
Event: send-message
Payload: {
  roomId: string
  content: string
  messageType?: 'TEXT' | 'IMAGE'
  imageUrl?: string
}
Response: {
  success: boolean
  messageId: string
  error?: string
}
```

### 4. 타이핑 표시 시작
```
Event: typing-start
Payload: {
  roomId: string
}
```

### 5. 타이핑 표시 종료
```
Event: typing-stop
Payload: {
  roomId: string
}
```

---

## 서버 → 클라이언트 이벤트

### 1. 새 메시지 수신
```
Event: new-message
Payload: {
  id: string
  roomId: string
  content: string
  senderId: string
  senderNickname: string
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM'
  imageUrl?: string
  createdAt: string
}
```

### 2. 메시지 전송 성공 확인
```
Event: message-sent
Payload: {
  messageId: string
  roomId: string
  createdAt: string
}
```

### 3. 메시지 전송 실패
```
Event: message-error
Payload: {
  error: string
  roomId?: string
}
```

### 4. 사용자 타이핑 중
```
Event: user-typing
Payload: {
  roomId: string
  userId: string
  nickname: string
}
```

### 5. 사용자 타이핑 종료
```
Event: user-stopped-typing
Payload: {
  roomId: string
  userId: string
}
```

### 6. 사용자 입장 알림
```
Event: user-joined
Payload: {
  roomId: string
  userId: string
  nickname: string
  joinedAt: string
}
```

### 7. 사용자 퇴장 알림
```
Event: user-left
Payload: {
  roomId: string
  userId: string
  nickname: string
  leftAt: string
}
```

### 8. 연결 오류
```
Event: error
Payload: {
  message: string
  code?: string
}
```

### 9. 인증 실패
```
Event: unauthorized
Payload: {
  message: string
}
```

---

## 연결 라이프사이클

### 연결 시
1. 클라이언트가 JWT 토큰과 함께 Socket.IO 연결
2. 서버가 토큰 검증
3. 검증 성공 시 사용자 정보를 소켓 세션에 저장
4. `connect` 이벤트 발생

### 채팅방 입장 시
1. 클라이언트가 `join-room` 이벤트 전송
2. 서버가 권한 확인 (건물 멤버십)
3. Socket.IO Room에 조인
4. 같은 방의 다른 사용자들에게 `user-joined` 이벤트 브로드캐스트

### 메시지 전송 시
1. 클라이언트가 `send-message` 이벤트 전송
2. 서버가 메시지 검증 및 DB 저장
3. 같은 방의 모든 사용자에게 `new-message` 이벤트 브로드캐스트
4. 전송자에게 `message-sent` 이벤트로 확인

### 연결 종료 시
1. 클라이언트가 연결 종료 또는 `leave-room` 이벤트
2. Socket.IO Room에서 자동 제거
3. 같은 방의 다른 사용자들에게 `user-left` 이벤트 브로드캐스트

---

## 주의사항
- MVP에서는 읽음 표시 기능 없음
- 온라인 상태 표시 기능 없음
- 모든 메시지는 DB에 저장됨
- 건물 전체 채팅방은 자동 생성 (buildingId 기반)
- 주제 채팅방은 게시글에서 생성 가능

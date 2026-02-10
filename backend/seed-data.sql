-- ============================================
-- ZIPPER 데이터베이스 시드 데이터
-- 위치 기반 커뮤니티 (아파트 단지 단위)
-- ============================================

-- 1. 건물 데이터 (5개 아파트 단지/건물)
-- 아파트는 단지 단위로 하나의 커뮤니티
-- 101동, 102동 등은 같은 건물(단지)로 취급

INSERT INTO buildings (
  name, type, city, district, neighborhood,
  "roadName", "roadNumber", "roadAddress",
  "lotNumber", "lotAddress",
  "buildingCode", "postalCode",
  latitude, longitude,
  "totalHouseholds", "userCount", "isActive", "isVerified",
  "createdAt", "updatedAt"
) VALUES
-- 강남구 아파트 단지 1
(
  '래미안 강남',
  'apartment',
  '서울특별시', '강남구', '역삼동',
  '테헤란로', '123',
  '서울특별시 강남구 테헤란로 123',
  '123-45',
  '서울특별시 강남구 역삼동 123-45',
  '1168010100100000001',
  '06234',
  37.4979, 127.0276,
  1200, 5, true, true,
  NOW() - INTERVAL '1 year', NOW()
),

-- 강남구 아파트 단지 2
(
  '힐스테이트 역삼',
  'apartment',
  '서울특별시', '강남구', '역삼동',
  '언주로', '456',
  '서울특별시 강남구 언주로 456',
  '234-56',
  '서울특별시 강남구 역삼동 234-56',
  '1168010100200000001',
  '06235',
  37.4989, 127.0286,
  800, 3, true, true,
  NOW() - INTERVAL '1 year', NOW()
),

-- 강남구 오피스텔 (단일 건물)
(
  '트리마제 오피스텔',
  'officetel',
  '서울특별시', '강남구', '삼성동',
  '영동대로', '789',
  '서울특별시 강남구 영동대로 789',
  '345-67',
  '서울특별시 강남구 삼성동 345-67',
  '1168010500100000001',
  '06236',
  37.5089, 127.0386,
  250, 2, true, true,
  NOW() - INTERVAL '1 year', NOW()
),

-- 서초구 아파트 단지 1
(
  '자이 서초타워',
  'apartment',
  '서울특별시', '서초구', '서초동',
  '서초대로', '234',
  '서울특별시 서초구 서초대로 234',
  '456-78',
  '서울특별시 서초구 서초동 456-78',
  '1165010100100000001',
  '06590',
  37.4833, 127.0322,
  1500, 0, true, true,
  NOW() - INTERVAL '1 year', NOW()
),

-- 서초구 아파트 단지 2
(
  '아크로 서리풀',
  'apartment',
  '서울특별시', '서초구', '반포동',
  '반포대로', '567',
  '서울특별시 서초구 반포대로 567',
  '567-89',
  '서울특별시 서초구 반포동 567-89',
  '1165010300100000001',
  '06591',
  37.4943, 127.0122,
  900, 0, true, true,
  NOW() - INTERVAL '1 year', NOW()
);

-- 2. 사용자 데이터 (10명) - 건물별로 배치, 동/호수 정보 포함
-- 비밀번호는 모두 'password123'
-- 같은 단지 내 다른 동에 사는 사람들도 같은 buildingId

INSERT INTO users (email, password, "phoneNumber", "buildingId", dong, ho, "isBuildingVerified", "createdAt", "updatedAt") VALUES
-- 래미안 강남 (buildingId=1) - 5명이 다른 동에 거주
('hyemi@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-1234-5678', 1, '101동', '1201호', true, NOW() - INTERVAL '30 days', NOW()),
('minsu@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-2345-6789', 1, '102동', '803호', true, NOW() - INTERVAL '25 days', NOW()),
('jihyun@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-3456-7890', 1, '101동', '1505호', true, NOW() - INTERVAL '20 days', NOW()),
('dongwoo@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-4567-8901', 1, '103동', '902호', true, NOW() - INTERVAL '15 days', NOW()),
('sujin@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-5678-9012', 1, '102동', '1104호', true, NOW() - INTERVAL '12 days', NOW()),

-- 힐스테이트 역삼 (buildingId=2) - 3명이 다른 동에 거주
('junho@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-6789-0123', 2, 'A동', '701호', true, NOW() - INTERVAL '10 days', NOW()),
('yuna@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-7890-1234', 2, 'B동', '1203호', true, NOW() - INTERVAL '8 days', NOW()),
('seungho@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-8901-2345', 2, 'A동', '1502호', true, NOW() - INTERVAL '5 days', NOW()),

-- 트리마제 오피스텔 (buildingId=3) - 동 구분 없음
('jiwon@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-9012-3456', 3, NULL, '805호', true, NOW() - INTERVAL '3 days', NOW()),
('taehyung@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '010-0123-4567', 3, NULL, '1207호', true, NOW() - INTERVAL '1 day', NOW());

-- 3. 게시글 데이터 - 건물(단지)별로 작성됨
-- ============================================
-- 건물 1 (래미안 강남) - 20개 게시글
-- 101동, 102동, 103동 사람들이 모두 같은 커뮤니티 사용
-- ============================================

-- 같이 사요 (6개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(1, 1, 'togather', '🍗 치킨 같이 시킬 분 (101동)', '2마리 너무 많아서 나눠요. 교촌치킨 허니콤보 생각 중이에요!', '{}', 15, 8, 45, 23.5, true, NOW() - INTERVAL '5 minutes', NOW()),
(2, 1, 'togather', '🥤 편의점 행사 같이 해요 (102동)', '2+1 행사 중이래요. 음료수나 과자 같이 사실 분?', '{}', 12, 5, 38, 17.0, true, NOW() - INTERVAL '30 minutes', NOW()),
(3, 1, 'togather', '🍕 피자 공동구매 (101동)', '도미노피자 2판 시키면 할인이래요. 같이 시키실 분 계신가요?', '{}', 18, 12, 56, 30.0, true, NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 'togather', '🥩 닭가슴살 대량 구매 (103동)', '헬스하시는 분들 모여서 같이 구매해요. 1kg당 가격 저렴해집니다', '{}', 10, 6, 32, 16.0, false, NOW() - INTERVAL '2 hours', NOW()),
(5, 1, 'togather', '☕️ 스타벅스 텀블러 공구 (102동)', '여름 시즌 한정판 텀블러 공동구매 하실 분?', '{}', 8, 4, 28, 12.0, false, NOW() - INTERVAL '3 hours', NOW()),
(1, 1, 'togather', '🍜 족발 나눠먹어요 (101동)', '오늘 저녁 족발 시킬건데 반반 나눌 분 계신가요?', '{}', 20, 15, 67, 35.0, true, NOW() - INTERVAL '4 hours', NOW());

-- 나눔 (5개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(2, 1, 'share', '📦 아기 옷 나눔해요 (102동 1층)', '사이즈 80~90, 상태 좋아요. 필요하신 분 연락주세요', '{}', 10, 4, 30, 14.0, false, NOW() - INTERVAL '1 hour', NOW()),
(3, 1, 'share', '📚 책 나눔합니다 (101동)', '소설책 10권 정도 드려요. 먼저 연락주시는 분께', '{}', 7, 3, 25, 10.0, false, NOW() - INTERVAL '2 hours', NOW()),
(4, 1, 'share', '🪴 화분 나눔 (103동)', '이사 가면서 못 가져가는 화분들 나눔해요', '{}', 12, 6, 38, 18.0, false, NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 'share', '🎮 보드게임 나눔 (102동)', '안 하는 보드게임 3개 드려요. 상태 좋습니다', '{}', 9, 5, 28, 14.0, false, NOW() - INTERVAL '4 hours', NOW()),
(1, 1, 'share', '🍚 쌀 조금 나눔 (101동)', '쌀 너무 많이 샀어요. 2kg 정도 나눠드려요', '{}', 11, 7, 34, 18.0, false, NOW() - INTERVAL '5 hours', NOW());

-- ZIP 생활 (5개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(2, 1, 'lifestyle', '🛠 엘베 점검 언제 끝나요?', '102동 엘베 공지 못 봐서 혹시 아시는 분 계신가요?', '{}', 25, 15, 78, 40.0, true, NOW() - INTERVAL '30 minutes', NOW()),
(3, 1, 'lifestyle', '🚗 주차장 CCTV 확인 문의', '101동 앞 주차장에서 차 긁힌 거 같은데 확인 가능한가요?', '{}', 18, 11, 56, 29.0, true, NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 'lifestyle', '♻️ 분리수거 요일이 언제죠?', '103동으로 이사 온 지 얼마 안 돼서 잘 모르겠어요', '{}', 15, 8, 45, 23.0, false, NOW() - INTERVAL '2 hours', NOW()),
(5, 1, 'lifestyle', '🔊 층간소음 민원 (102동)', '위층에서 너무 시끄러운데 어떻게 해야 할까요?', '{}', 22, 18, 72, 40.0, true, NOW() - INTERVAL '3 hours', NOW()),
(1, 1, 'lifestyle', '💡 복도 전등 고장났어요 (101동)', '3층 복도 전등이 나갔는데 관리사무소에 연락했나요?', '{}', 10, 5, 32, 15.0, false, NOW() - INTERVAL '4 hours', NOW());

-- 잡담 (4개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(2, 1, 'chat', '🐱 요즘 단지 고양이 보신 분?', '치즈냥이 어디 갔을까요? 걱정돼요. 보통 102동 쪽에 있었는데...', '{}', 20, 12, 65, 32.0, true, NOW() - INTERVAL '1 hour', NOW()),
(3, 1, 'chat', '☕️ 근처 카페 추천해주세요', '조용하고 와이파이 잘 되는 곳 찾아요', '{}', 15, 10, 48, 25.0, false, NOW() - INTERVAL '2 hours', NOW()),
(4, 1, 'chat', '🍜 맛집 추천 부탁드려요', '이 동네 처음인데 맛집 좀 알려주세요!', '{}', 18, 14, 58, 32.0, true, NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 'chat', '🏃 운동 같이 하실 분', '아침 조깅 같이 하실 분 모집해요. 단지 내 트랙에서!', '{}', 14, 9, 45, 23.0, false, NOW() - INTERVAL '4 hours', NOW());

-- ============================================
-- 건물 2 (힐스테이트 역삼) - 8개 게시글
-- A동, B동 사람들이 모두 같은 커뮤니티 사용
-- ============================================

-- 같이 사요 (3개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(6, 2, 'togather', '🍔 맥딜리버리 같이 시켜요 (A동)', '배달비 나눠요. 빅맥 세트 시킬 예정!', '{}', 8, 4, 28, 12.0, false, NOW() - INTERVAL '1 hour', NOW()),
(7, 2, 'togather', '🧴 생필품 공동구매 (B동)', '쿠팡 로켓배송 묶음 배송하실 분?', '{}', 12, 6, 35, 18.0, false, NOW() - INTERVAL '2 hours', NOW()),
(8, 2, 'togather', '🥗 샐러드 정기배송 (A동)', '헬시플 정기배송 같이 신청하면 싸요', '{}', 10, 5, 30, 15.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 나눔 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(6, 2, 'share', '🖨 프린터 나눔합니다 (A동)', '새 거 샀어요. 잘 작동해요', '{}', 7, 3, 22, 10.0, false, NOW() - INTERVAL '4 hours', NOW()),
(7, 2, 'share', '🎾 테니스 라켓 드려요 (B동)', '안 쓰는 라켓 2개 드립니다', '{}', 5, 2, 18, 7.0, false, NOW() - INTERVAL '5 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(6, 2, 'lifestyle', '📦 택배함 비밀번호', 'A동 택배함 비밀번호 변경됐나요?', '{}', 12, 7, 38, 19.0, false, NOW() - INTERVAL '2 hours', NOW()),
(8, 2, 'lifestyle', '🚿 수압이 약해요', 'A동 고층 수압이 약한데 다른 동도 그런가요?', '{}', 15, 9, 42, 24.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(7, 2, 'chat', '🎬 넷플릭스 추천작', '요즘 볼만한 거 추천해주세요!', '{}', 10, 6, 32, 16.0, false, NOW() - INTERVAL '4 hours', NOW());

-- ============================================
-- 건물 3 (트리마제 오피스텔) - 5개 게시글
-- 오피스텔은 동 구분 없음
-- ============================================

-- 같이 사요 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(9, 3, 'togather', '🍱 점심 도시락 공동주문', '샐러디 단체 주문하면 할인이에요', '{}', 6, 3, 20, 9.0, false, NOW() - INTERVAL '2 hours', NOW()),
(10, 3, 'togather', '☕️ 커피 원두 공동구매', '스페셜티 원두 킬로 단위로 사요', '{}', 8, 4, 25, 12.0, false, NOW() - INTERVAL '3 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(9, 3, 'lifestyle', '🌐 인터넷 속도 느린 분?', 'Wi-Fi 속도가 너무 느려요', '{}', 12, 7, 35, 19.0, false, NOW() - INTERVAL '1 hour', NOW()),
(10, 3, 'lifestyle', '🔑 출입문 고장', '1층 출입문 자동문이 안 닫혀요', '{}', 10, 5, 28, 15.0, false, NOW() - INTERVAL '2 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, "imageUrls", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
(9, 3, 'chat', '🎮 게임 같이 하실 분', '발로란트 같이 해요', '{}', 7, 4, 22, 11.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 4. 댓글 데이터 (건물 1의 인기 게시글 중심)
-- 다른 동에 사는 사람들이 서로 댓글 교류
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
-- 게시글 1번 댓글 (치킨 - 101동 글에 102동, 103동 사람들이 댓글)
(1, 2, '102동인데 저요! 같이 시켜요', NULL, 3, NOW() - INTERVAL '4 minutes', NOW()),
(1, 3, '101동이에요. 저도 참여하고 싶어요!', NULL, 2, NOW() - INTERVAL '3 minutes', NOW()),
(1, 1, '좋아요! 오늘 7시쯤 101동 앞에서 만나요', 1, 1, NOW() - INTERVAL '2 minutes', NOW()),
(1, 4, '103동인데 허니콤보 맛있죠 ㅎㅎ', NULL, 1, NOW() - INTERVAL '2 minutes', NOW()),
(1, 5, '102동이에요. 저도 끼워주세요!', NULL, 0, NOW() - INTERVAL '1 minute', NOW()),
(1, 2, '배달비 나눠서 내면 좋겠네요', NULL, 2, NOW() - INTERVAL '1 minute', NOW()),
(1, 3, '시간 맞으면 저도요!', NULL, 1, NOW() - INTERVAL '30 seconds', NOW()),
(1, 4, '다음에도 같이 시켜요', NULL, 0, NOW() - INTERVAL '10 seconds', NOW());

-- 게시글 3번 댓글 (피자)
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
(3, 4, '103동인데 피자 좋죠! 참여합니다', NULL, 3, NOW() - INTERVAL '55 minutes', NOW()),
(3, 5, '102동이에요. 저도요! 페퍼로니 가능한가요?', NULL, 2, NOW() - INTERVAL '50 minutes', NOW()),
(3, 3, '네 페퍼로니 좋아요', 10, 1, NOW() - INTERVAL '45 minutes', NOW()),
(3, 1, '콤비네이션도 하나 시켜요', NULL, 2, NOW() - INTERVAL '40 minutes', NOW()),
(3, 2, '102동입니다. 좋은 생각이네요!', NULL, 1, NOW() - INTERVAL '35 minutes', NOW()),
(3, 4, '저도 한 판 먹고 싶어요', NULL, 1, NOW() - INTERVAL '30 minutes', NOW()),
(3, 5, '시간 언제로 할까요?', NULL, 0, NOW() - INTERVAL '25 minutes', NOW()),
(3, 1, '저녁 6시 어떠세요?', NULL, 1, NOW() - INTERVAL '20 minutes', NOW()),
(3, 2, '6시 좋아요!', NULL, 0, NOW() - INTERVAL '15 minutes', NOW()),
(3, 3, '저도 6시 괜찮습니다', NULL, 0, NOW() - INTERVAL '10 minutes', NOW()),
(3, 4, '그럼 6시로 확정할게요. 101동 관리사무소 앞', 16, 2, NOW() - INTERVAL '5 minutes', NOW()),
(3, 5, '기대됩니다!', NULL, 1, NOW() - INTERVAL '2 minutes', NOW());

-- 게시글 12번 댓글 (엘베 점검 - 102동 글에 다른 동 사람들이 댓글)
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
(12, 1, '101동도 오늘 오후 5시까지래요', NULL, 5, NOW() - INTERVAL '25 minutes', NOW()),
(12, 3, '감사합니다!', 21, 1, NOW() - INTERVAL '20 minutes', NOW()),
(12, 4, '103동은 어제 했어요. 계단 이용하세요', NULL, 2, NOW() - INTERVAL '18 minutes', NOW()),
(12, 5, '102동인데 저도 궁금했어요', NULL, 1, NOW() - INTERVAL '15 minutes', NOW()),
(12, 1, '관리사무소에 전화해보세요', NULL, 3, NOW() - INTERVAL '12 minutes', NOW()),
(12, 2, '매달 정기 점검이래요', NULL, 2, NOW() - INTERVAL '10 minutes', NOW()),
(12, 3, '불편하긴 하네요', NULL, 1, NOW() - INTERVAL '8 minutes', NOW()),
(12, 4, '미리 공지 좀 해주지', NULL, 4, NOW() - INTERVAL '6 minutes', NOW()),
(12, 5, '동의합니다', 28, 2, NOW() - INTERVAL '5 minutes', NOW()),
(12, 1, '다음부터는 미리 알려주면 좋겠어요', NULL, 3, NOW() - INTERVAL '4 minutes', NOW()),
(12, 2, '공지 게시판에 있었어요', NULL, 1, NOW() - INTERVAL '3 minutes', NOW()),
(12, 3, '아 그렇군요', 31, 0, NOW() - INTERVAL '2 minutes', NOW()),
(12, 4, '앱으로 알림 오면 좋겠네요', NULL, 2, NOW() - INTERVAL '1 minute', NOW()),
(12, 5, '좋은 의견이에요', 33, 1, NOW() - INTERVAL '30 seconds', NOW()),
(12, 1, '건의해볼게요', NULL, 0, NOW() - INTERVAL '10 seconds', NOW());

-- 게시글 17번 댓글 (고양이)
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
(17, 1, '어제 101동 주차장에서 봤어요', NULL, 4, NOW() - INTERVAL '55 minutes', NOW()),
(17, 3, '다행이네요!', 36, 2, NOW() - INTERVAL '50 minutes', NOW()),
(17, 4, '103동에서도 봤어요. 치즈냥이 귀여워요', NULL, 3, NOW() - INTERVAL '45 minutes', NOW()),
(17, 5, '사진 있으신가요?', NULL, 1, NOW() - INTERVAL '40 minutes', NOW()),
(17, 1, '저도 보고 싶어요', NULL, 2, NOW() - INTERVAL '35 minutes', NOW()),
(17, 2, '102동 쪽에서 밥 주면 오더라고요', NULL, 3, NOW() - INTERVAL '30 minutes', NOW()),
(17, 3, '간식 챙겨가야겠네요', 41, 1, NOW() - INTERVAL '25 minutes', NOW()),
(17, 4, '고양이 좋아해요', NULL, 2, NOW() - INTERVAL '20 minutes', NOW()),
(17, 5, '저도 키우고 싶어요', NULL, 1, NOW() - INTERVAL '15 minutes', NOW()),
(17, 1, '치즈냥이 건강하면 좋겠어요', NULL, 3, NOW() - INTERVAL '10 minutes', NOW());

-- 5. 좋아요 데이터
-- 같은 단지 내 다른 동 사람들이 서로의 글에 좋아요
INSERT INTO likes ("userId", "targetType", "targetId", "createdAt") VALUES
-- 게시글 1 (치킨 - 101동 글) - 모든 동 사람들이 좋아요
(2, 'post', 1, NOW() - INTERVAL '5 minutes'),
(3, 'post', 1, NOW() - INTERVAL '4 minutes'),
(4, 'post', 1, NOW() - INTERVAL '3 minutes'),
(5, 'post', 1, NOW() - INTERVAL '2 minutes'),
(1, 'post', 1, NOW() - INTERVAL '1 minute'),

-- 게시글 3 (피자 - 101동 글)
(1, 'post', 3, NOW() - INTERVAL '1 hour'),
(2, 'post', 3, NOW() - INTERVAL '55 minutes'),
(3, 'post', 3, NOW() - INTERVAL '50 minutes'),
(4, 'post', 3, NOW() - INTERVAL '45 minutes'),
(5, 'post', 3, NOW() - INTERVAL '40 minutes'),

-- 게시글 12 (엘베 - 102동 글)
(1, 'post', 12, NOW() - INTERVAL '30 minutes'),
(2, 'post', 12, NOW() - INTERVAL '28 minutes'),
(3, 'post', 12, NOW() - INTERVAL '26 minutes'),
(4, 'post', 12, NOW() - INTERVAL '24 minutes'),
(5, 'post', 12, NOW() - INTERVAL '22 minutes'),

-- 게시글 17 (고양이 - 102동 글)
(1, 'post', 17, NOW() - INTERVAL '1 hour'),
(2, 'post', 17, NOW() - INTERVAL '58 minutes'),
(3, 'post', 17, NOW() - INTERVAL '56 minutes'),
(4, 'post', 17, NOW() - INTERVAL '54 minutes'),
(5, 'post', 17, NOW() - INTERVAL '52 minutes'),

-- 게시글 21 (건물2 맥딜리버리)
(6, 'post', 21, NOW() - INTERVAL '1 hour'),
(7, 'post', 21, NOW() - INTERVAL '55 minutes'),
(8, 'post', 21, NOW() - INTERVAL '50 minutes'),

-- 게시글 29 (건물3 도시락)
(9, 'post', 29, NOW() - INTERVAL '2 hours'),
(10, 'post', 29, NOW() - INTERVAL '1 hour 55 minutes'),

-- 댓글 좋아요
(1, 'comment', 1, NOW() - INTERVAL '4 minutes'),
(3, 'comment', 1, NOW() - INTERVAL '3 minutes'),
(4, 'comment', 1, NOW() - INTERVAL '2 minutes'),
(5, 'comment', 21, NOW() - INTERVAL '20 minutes'),
(1, 'comment', 21, NOW() - INTERVAL '18 minutes'),
(2, 'comment', 21, NOW() - INTERVAL '16 minutes'),
(3, 'comment', 21, NOW() - INTERVAL '14 minutes'),
(4, 'comment', 21, NOW() - INTERVAL '12 minutes');

-- ============================================
-- 실행 순서:
-- 1. 데이터베이스 초기화 (선택사항)
--    DROP TABLE IF EXISTS likes, comments, posts, users, buildings CASCADE;
-- 
-- 2. 백엔드 서버 시작 (자동으로 테이블 생성)
--    cd backend && npm run start:dev
--
-- 3. 이 SQL 파일 실행
--    psql -U postgres -d zipper -f seed-data.sql
--    또는
--    \i /path/to/seed-data.sql
-- 
-- 참고:
-- - 건물은 아파트 "단지" 단위로 관리
-- - 101동, 102동, 103동은 같은 buildingId 공유
-- - 사용자 테이블에 dong(동), ho(호수) 컬럼 추가
-- - 같은 단지 내 모든 동 사람들이 하나의 커뮤니티
-- - 게시글/댓글에서 동 정보를 명시하여 위치 파악 가능
-- - 비밀번호는 모두 'password123'
-- ============================================

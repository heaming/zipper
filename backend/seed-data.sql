-- ============================================
-- ZIPPER 데이터베이스 시드 데이터
-- 위치 기반 커뮤니티 (아파트 단지 단위)
-- ============================================

-- 1. 건물 데이터 (5개 아파트 단지/건물)
-- 아파트는 단지 단위로 하나의 커뮤니티
-- 101동, 102동 등은 같은 건물(단지)로 취급

INSERT INTO buildings (
    name, "buildingType", "roadAddress", "jibunAddress", "bname", "sido", "sigungu",
    latitude, longitude,
    "totalHouseholds", "isActive", "inviteCode",
    "createdAt", "updatedAt"
) VALUES
-- 강남구 아파트 단지 1
(
    '래미안 강남',
    'APARTMENT',
    '서울특별시 강남구 테헤란로 123',
    '서울특별시 강남구 역삼동 123-45',
    '역삼동',
    '서울특별시',
    '강남구',
    37.4979, 127.0276,
    1200, true, 'RGMN001',
    NOW() - INTERVAL '1 year', NOW()
),

-- 강남구 아파트 단지 2
(
    '힐스테이트 역삼',
    'APARTMENT',
    '서울특별시 강남구 언주로 456',
    '서울특별시 강남구 역삼동 234-56',
    '역삼동',
    '서울특별시',
    '강남구',
    37.4989, 127.0286,
    800, true, 'HSTT002',
    NOW() - INTERVAL '1 year', NOW()
),

-- 강남구 오피스텔 (단일 건물)
(
    '트리마제 오피스텔',
    'OFFICETEL',
    '서울특별시 강남구 영동대로 789',
    '서울특별시 강남구 삼성동 345-67',
    '삼성동',
    '서울특별시',
    '강남구',
    37.5089, 127.0386,
    250, true, 'TRMZ003',
    NOW() - INTERVAL '1 year', NOW()
),

-- 서초구 아파트 단지 1
(
    '자이 서초타워',
    'APARTMENT',
    '서울특별시 서초구 서초대로 234',
    '서울특별시 서초구 서초동 456-78',
    '서초동',
    '서울특별시',
    '서초구',
    37.4833, 127.0322,
    1500, true, 'ZAIS004',
    NOW() - INTERVAL '1 year', NOW()
),

-- 서초구 아파트 단지 2
(
    '아크로 서리풀',
    'APARTMENT',
    '서울특별시 서초구 반포대로 567',
    '서울특별시 서초구 반포동 567-89',
    '반포동',
    '서울특별시',
    '서초구',
    37.4943, 127.0122,
    900, true, 'ACRO005',
    NOW() - INTERVAL '1 year', NOW()
);

-- 2. 사용자 데이터 (10명) - 건물별로 배치, 동/호수 정보 포함
-- 비밀번호는 모두 'password123'
-- 같은 단지 내 다른 동에 사는 사람들도 같은 buildingId

INSERT INTO users (
    email, password, nickname, "phoneNumber", "buildingId", dong, ho,
    "buildingVerificationStatus", "activityScore", level,
    "createdAt", "updatedAt"
) VALUES
-- 래미안 강남 (buildingId=1) - 5명이 다른 동에 거주
('hyemi@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '혜미', '010-1234-5678', 1, '101동', '1201호', 'VERIFIED', 150, 2, NOW() - INTERVAL '30 days', NOW()),
('minsu@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '민수', '010-2345-6789', 1, '102동', '803호', 'VERIFIED', 120, 2, NOW() - INTERVAL '25 days', NOW()),
('jihyun@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '지현', '010-3456-7890', 1, '101동', '1505호', 'VERIFIED', 180, 3, NOW() - INTERVAL '20 days', NOW()),
('dongwoo@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '동우', '010-4567-8901', 1, '103동', '902호', 'VERIFIED', 100, 1, NOW() - INTERVAL '15 days', NOW()),
('sujin@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '수진', '010-5678-9012', 1, '102동', '1104호', 'VERIFIED', 90, 1, NOW() - INTERVAL '12 days', NOW()),

-- 힐스테이트 역삼 (buildingId=2) - 3명이 다른 동에 거주
('junho@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '준호', '010-6789-0123', 2, 'A동', '701호', 'VERIFIED', 80, 1, NOW() - INTERVAL '10 days', NOW()),
('yuna@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '유나', '010-7890-1234', 2, 'B동', '1203호', 'VERIFIED', 70, 1, NOW() - INTERVAL '8 days', NOW()),
('seungho@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '승호', '010-8901-2345', 2, 'A동', '1502호', 'VERIFIED', 60, 1, NOW() - INTERVAL '5 days', NOW()),

-- 트리마제 오피스텔 (buildingId=3) - 동 구분 없음
('jiwon@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '지원', '010-9012-3456', 3, NULL, '805호', 'VERIFIED', 50, 1, NOW() - INTERVAL '3 days', NOW()),
('taehyung@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '태형', '010-0123-4567', 3, NULL, '1207호', 'VERIFIED', 40, 1, NOW() - INTERVAL '1 day', NOW());

-- 2-1. 건물 멤버십 데이터 (users의 buildingId와 일치)
-- 모든 사용자가 자신의 buildingId에 대한 멤버십을 가짐
INSERT INTO building_memberships ("userId", "buildingId", status, "joinedAt", "createdAt", "updatedAt") VALUES
-- 래미안 강남 (buildingId=1)
(1, 1, 'ACTIVE', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW()),
(2, 1, 'ACTIVE', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW()),
(3, 1, 'ACTIVE', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW()),
(4, 1, 'ACTIVE', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW()),
(5, 1, 'ACTIVE', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW()),

-- 힐스테이트 역삼 (buildingId=2)
(6, 2, 'ACTIVE', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW()),
(7, 2, 'ACTIVE', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW()),
(8, 2, 'ACTIVE', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),

-- 트리마제 오피스텔 (buildingId=3)
(9, 3, 'ACTIVE', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW()),
(10, 3, 'ACTIVE', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW());

-- 3. 게시글 데이터 - 건물(단지)별로 작성됨
-- ============================================
-- 건물 1 (래미안 강남) - 20개 게시글
-- 101동, 102동, 103동 사람들이 모두 같은 커뮤니티 사용
-- ============================================

-- 같이 사요 (6개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (1, 1, 'togather', '🍗 치킨 같이 시킬 분 (101동)', '2마리 너무 많아서 나눠요. 교촌치킨 허니콤보 생각 중이에요!', 'active', false, 15, 8, 45, 23.5, true, NOW() - INTERVAL '5 minutes', NOW()),
                                                                                                                                                                                    (2, 1, 'togather', '🥤 편의점 행사 같이 해요 (102동)', '2+1 행사 중이래요. 음료수나 과자 같이 사실 분?', 'active', false, 12, 5, 38, 17.0, true, NOW() - INTERVAL '30 minutes', NOW()),
                                                                                                                                                                                    (3, 1, 'togather', '🍕 피자 공동구매 (101동)', '도미노피자 2판 시키면 할인이래요. 같이 시키실 분 계신가요?', 'active', false, 18, 12, 56, 30.0, true, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (4, 1, 'togather', '🥩 닭가슴살 대량 구매 (103동)', '헬스하시는 분들 모여서 같이 구매해요. 1kg당 가격 저렴해집니다', 'active', false, 10, 6, 32, 16.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (5, 1, 'togather', '☕️ 스타벅스 텀블러 공구 (102동)', '여름 시즌 한정판 텀블러 공동구매 하실 분?', 'active', false, 8, 4, 28, 12.0, false, NOW() - INTERVAL '3 hours', NOW()),
                                                                                                                                                                                    (1, 1, 'togather', '🍜 족발 나눠먹어요 (101동)', '오늘 저녁 족발 시킬건데 반반 나눌 분 계신가요?', 'active', false, 20, 15, 67, 35.0, true, NOW() - INTERVAL '4 hours', NOW());

-- 나눔 (5개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (2, 1, 'share', '📦 아기 옷 나눔해요 (102동 1층)', '사이즈 80~90, 상태 좋아요. 필요하신 분 연락주세요', 'active', false, 10, 4, 30, 14.0, false, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (3, 1, 'share', '📚 책 나눔합니다 (101동)', '소설책 10권 정도 드려요. 먼저 연락주시는 분께', 'active', false, 7, 3, 25, 10.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (4, 1, 'share', '🪴 화분 나눔 (103동)', '이사 가면서 못 가져가는 화분들 나눔해요', 'active', false, 12, 6, 38, 18.0, false, NOW() - INTERVAL '3 hours', NOW()),
                                                                                                                                                                                    (5, 1, 'share', '🎮 보드게임 나눔 (102동)', '안 하는 보드게임 3개 드려요. 상태 좋습니다', 'active', false, 9, 5, 28, 14.0, false, NOW() - INTERVAL '4 hours', NOW()),
                                                                                                                                                                                    (1, 1, 'share', '🍚 쌀 조금 나눔 (101동)', '쌀 너무 많이 샀어요. 2kg 정도 나눠드려요', 'active', false, 11, 7, 34, 18.0, false, NOW() - INTERVAL '5 hours', NOW());

-- ZIP 생활 (5개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (2, 1, 'lifestyle', '🛠 엘베 점검 언제 끝나요?', '102동 엘베 공지 못 봐서 혹시 아시는 분 계신가요?', 'active', false, 25, 15, 78, 40.0, true, NOW() - INTERVAL '30 minutes', NOW()),
                                                                                                                                                                                    (3, 1, 'lifestyle', '🚗 주차장 CCTV 확인 문의', '101동 앞 주차장에서 차 긁힌 거 같은데 확인 가능한가요?', 'active', false, 18, 11, 56, 29.0, true, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (4, 1, 'lifestyle', '♻️ 분리수거 요일이 언제죠?', '103동으로 이사 온 지 얼마 안 돼서 잘 모르겠어요', 'active', false, 15, 8, 45, 23.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (5, 1, 'lifestyle', '🔊 층간소음 민원 (102동)', '위층에서 너무 시끄러운데 어떻게 해야 할까요?', 'active', false, 22, 18, 72, 40.0, true, NOW() - INTERVAL '3 hours', NOW()),
                                                                                                                                                                                    (1, 1, 'lifestyle', '💡 복도 전등 고장났어요 (101동)', '3층 복도 전등이 나갔는데 관리사무소에 연락했나요?', 'active', false, 10, 5, 32, 15.0, false, NOW() - INTERVAL '4 hours', NOW());

-- 잡담 (4개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (2, 1, 'chat', '🐱 요즘 단지 고양이 보신 분?', '치즈냥이 어디 갔을까요? 걱정돼요. 보통 102동 쪽에 있었는데...', 'active', false, 20, 12, 65, 32.0, true, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (3, 1, 'chat', '☕️ 근처 카페 추천해주세요', '조용하고 와이파이 잘 되는 곳 찾아요', 'active', false, 15, 10, 48, 25.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (4, 1, 'chat', '🍜 맛집 추천 부탁드려요', '이 동네 처음인데 맛집 좀 알려주세요!', 'active', false, 18, 14, 58, 32.0, true, NOW() - INTERVAL '3 hours', NOW()),
                                                                                                                                                                                    (5, 1, 'chat', '🏃 운동 같이 하실 분', '아침 조깅 같이 하실 분 모집해요. 단지 내 트랙에서!', 'active', false, 14, 9, 45, 23.0, false, NOW() - INTERVAL '4 hours', NOW());

-- ============================================
-- 건물 2 (힐스테이트 역삼) - 8개 게시글
-- A동, B동 사람들이 모두 같은 커뮤니티 사용
-- ============================================

-- 같이 사요 (3개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (6, 2, 'togather', '🍔 맥딜리버리 같이 시켜요 (A동)', '배달비 나눠요. 빅맥 세트 시킬 예정!', 'active', false, 8, 4, 28, 12.0, false, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (7, 2, 'togather', '🧴 생필품 공동구매 (B동)', '쿠팡 로켓배송 묶음 배송하실 분?', 'active', false, 12, 6, 35, 18.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (8, 2, 'togather', '🥗 샐러드 정기배송 (A동)', '헬시플 정기배송 같이 신청하면 싸요', 'active', false, 10, 5, 30, 15.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 나눔 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (6, 2, 'share', '🖨 프린터 나눔합니다 (A동)', '새 거 샀어요. 잘 작동해요', 'active', false, 7, 3, 22, 10.0, false, NOW() - INTERVAL '4 hours', NOW()),
                                                                                                                                                                                    (7, 2, 'share', '🎾 테니스 라켓 드려요 (B동)', '안 쓰는 라켓 2개 드립니다', 'active', false, 5, 2, 18, 7.0, false, NOW() - INTERVAL '5 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (6, 2, 'lifestyle', '📦 택배함 비밀번호', 'A동 택배함 비밀번호 변경됐나요?', 'active', false, 12, 7, 38, 19.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (8, 2, 'lifestyle', '🚿 수압이 약해요', 'A동 고층 수압이 약한데 다른 동도 그런가요?', 'active', false, 15, 9, 42, 24.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
    (7, 2, 'chat', '🎬 넷플릭스 추천작', '요즘 볼만한 거 추천해주세요!', 'active', false, 10, 6, 32, 16.0, false, NOW() - INTERVAL '4 hours', NOW());

-- ============================================
-- 건물 3 (트리마제 오피스텔) - 5개 게시글
-- 오피스텔은 동 구분 없음
-- ============================================

-- 같이 사요 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (9, 3, 'togather', '🍱 점심 도시락 공동주문', '샐러디 단체 주문하면 할인이에요', 'active', false, 6, 3, 20, 9.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (10, 3, 'togather', '☕️ 커피 원두 공동구매', '스페셜티 원두 킬로 단위로 사요', 'active', false, 8, 4, 25, 12.0, false, NOW() - INTERVAL '3 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (9, 3, 'lifestyle', '🌐 인터넷 속도 느린 분?', 'Wi-Fi 속도가 너무 느려요', 'active', false, 12, 7, 35, 19.0, false, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (10, 3, 'lifestyle', '🔑 출입문 고장', '1층 출입문 자동문이 안 닫혀요', 'active', false, 10, 5, 28, 15.0, false, NOW() - INTERVAL '2 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
    (9, 3, 'chat', '🎮 게임 같이 하실 분', '발로란트 같이 해요', 'active', false, 7, 4, 22, 11.0, false, NOW() - INTERVAL '3 hours', NOW());

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

-- 5. 게시글 좋아요 데이터 (post_likes 테이블)
-- 같은 단지 내 다른 동 사람들이 서로의 글에 좋아요
INSERT INTO post_likes ("userId", "postId", "createdAt") VALUES
-- 게시글 1 (치킨 - 101동 글) - 모든 동 사람들이 좋아요
(2, 1, NOW() - INTERVAL '5 minutes'),
(3, 1, NOW() - INTERVAL '4 minutes'),
(4, 1, NOW() - INTERVAL '3 minutes'),
(5, 1, NOW() - INTERVAL '2 minutes'),
(1, 1, NOW() - INTERVAL '1 minute'),

-- 게시글 3 (피자 - 101동 글)
(1, 3, NOW() - INTERVAL '1 hour'),
(2, 3, NOW() - INTERVAL '55 minutes'),
(3, 3, NOW() - INTERVAL '50 minutes'),
(4, 3, NOW() - INTERVAL '45 minutes'),
(5, 3, NOW() - INTERVAL '40 minutes'),

-- 게시글 12 (엘베 - 102동 글)
(1, 12, NOW() - INTERVAL '30 minutes'),
(2, 12, NOW() - INTERVAL '28 minutes'),
(3, 12, NOW() - INTERVAL '26 minutes'),
(4, 12, NOW() - INTERVAL '24 minutes'),
(5, 12, NOW() - INTERVAL '22 minutes'),

-- 게시글 17 (고양이 - 102동 글)
(1, 17, NOW() - INTERVAL '1 hour'),
(2, 17, NOW() - INTERVAL '58 minutes'),
(3, 17, NOW() - INTERVAL '56 minutes'),
(4, 17, NOW() - INTERVAL '54 minutes'),
(5, 17, NOW() - INTERVAL '52 minutes'),

-- 게시글 21 (건물2 맥딜리버리)
(6, 21, NOW() - INTERVAL '1 hour'),
(7, 21, NOW() - INTERVAL '55 minutes'),
(8, 21, NOW() - INTERVAL '50 minutes'),

-- 게시글 29 (건물3 도시락)
(9, 29, NOW() - INTERVAL '2 hours'),
(10, 29, NOW() - INTERVAL '1 hour 55 minutes');

-- ============================================
-- 실행 순서:
-- 1. 데이터베이스 초기화 (선택사항)
--    DROP TABLE IF EXISTS likes, comments, posts, building_memberships, users, buildings CASCADE;
--    DROP SCHEMA public CASCADE;
--    CREATE SCHEMA public;
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
-- - 사용자 테이블에 dong(동), ho(호수) 컬럼 포함
-- - 같은 단지 내 모든 동 사람들이 하나의 커뮤니티
-- - 게시글/댓글에서 동 정보를 명시하여 위치 파악 가능
-- - 비밀번호는 모두 'password123'
-- - buildingType은 enum: APARTMENT, OFFICETEL, VILLA
-- - buildingVerificationStatus는 enum: PENDING, VERIFIED, REJECTED
-- - posts 테이블의 boardType은 enum: togather, share, lifestyle, chat, market
-- - posts 테이블의 status는 enum: active, closed, deleted
-- - 게시글 좋아요는 post_likes 테이블 사용 (userId, postId)
-- ============================================


-- ============================================
-- 추가 건물 데이터 (여의도 유화증권 & 목동 526-11)
-- ============================================

-- 여의도 유화증권 (오피스텔/상업시설)
INSERT INTO buildings (
    name, "buildingType", "roadAddress", "jibunAddress", "bname", "sido", "sigungu",
    latitude, longitude,
    "totalHouseholds", "isActive", "inviteCode",
    "createdAt", "updatedAt"
) VALUES
      (
          '유화증권 빌딩',
          'OFFICETEL',
          '서울특별시 영등포구 여의대로 108',
          '서울특별시 영등포구 여의도동 526-11',
          '여의도동',
          '서울특별시',
          '영등포구',
          37.5250, 126.9244,
          180, true, 'YHZN006',
          NOW() - INTERVAL '8 months', NOW()
      ),

-- 목동 526-11 (아파트 단지)
      (
          '목동 힐스테이트',
          'APARTMENT',
          '서울특별시 양천구 목동로 426',
          '서울특별시 양천구 목동 526-11',
          '목동',
          '서울특별시',
          '양천구',
          37.5364, 126.8774,
          600, true, 'MKDG007',
          NOW() - INTERVAL '6 months', NOW()
      );

-- 추가 사용자 데이터 (여의도 유화증권 - 3명)
INSERT INTO users (
    email, password, nickname, "phoneNumber", "buildingId", dong, ho,
    "buildingVerificationStatus", "activityScore", level,
    "createdAt", "updatedAt"
) VALUES
      ('yewon@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '예원', '010-1111-2222', 6, NULL, '1501호', 'VERIFIED', 110, 2, NOW() - INTERVAL '7 months', NOW()),
      ('seojun@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '서준', '010-2222-3333', 6, NULL, '2003호', 'VERIFIED', 95, 1, NOW() - INTERVAL '6 months', NOW()),
      ('haeun@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '하은', '010-3333-4444', 6, NULL, '1805호', 'VERIFIED', 85, 1, NOW() - INTERVAL '5 months', NOW());

-- 추가 사용자 데이터 (목동 526-11 - 4명)
INSERT INTO users (
    email, password, nickname, "phoneNumber", "buildingId", dong, ho,
    "buildingVerificationStatus", "activityScore", level,
    "createdAt", "updatedAt"
) VALUES
      ('minji@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '민지', '010-4444-5555', 7, '201동', '1002호', 'VERIFIED', 130, 2, NOW() - INTERVAL '5 months', NOW()),
      ('woojin@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '우진', '010-5555-6666', 7, '202동', '1503호', 'VERIFIED', 105, 2, NOW() - INTERVAL '4 months', NOW()),
      ('soyeon@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '소연', '010-6666-7777', 7, '201동', '805호', 'VERIFIED', 75, 1, NOW() - INTERVAL '3 months', NOW()),
      ('jaehyun@example.com', '$2b$10$7jV9SrKzWb57rlaeBbpD6uw2NgnVUYbQUz8tckH5istr.2kAOna3.', '재현', '010-7777-8888', 7, '203동', '1201호', 'VERIFIED', 65, 1, NOW() - INTERVAL '2 months', NOW());

-- 추가 건물 멤버십 데이터
INSERT INTO building_memberships ("userId", "buildingId", status, "joinedAt", "createdAt", "updatedAt") VALUES
-- 여의도 유화증권 (buildingId=6)
(11, 6, 'ACTIVE', NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months', NOW()),
(12, 6, 'ACTIVE', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months', NOW()),
(13, 6, 'ACTIVE', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months', NOW()),

-- 목동 526-11 (buildingId=7)
(14, 7, 'ACTIVE', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months', NOW()),
(15, 7, 'ACTIVE', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months', NOW()),
(16, 7, 'ACTIVE', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months', NOW()),
(17, 7, 'ACTIVE', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', NOW());

-- ============================================
-- 여의도 유화증권 (buildingId=6) - 8개 게시글
-- ============================================

-- 같이 사요 (3개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (11, 6, 'togather', '🍱 점심 도시락 같이 주문해요', '샐러디 단체 주문하면 배달비 무료예요. 같이 시킬 분?', 'active', false, 9, 4, 32, 13.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (12, 6, 'togather', '☕️ 원두커피 공동구매', '스타벅스 원두 1kg씩 나눠 살까요?', 'active', false, 7, 3, 25, 10.0, false, NOW() - INTERVAL '3 hours', NOW()),
                                                                                                                                                                                    (13, 6, 'togather', '🍕 저녁 피자 같이 시켜요', '배달비 나눠요. 도미노 피자 생각 중!', 'active', false, 11, 6, 38, 17.0, false, NOW() - INTERVAL '1 hour', NOW());

-- 나눔 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (11, 6, 'share', '📚 책 나눔합니다', '소설책 몇 권 드려요. 필요하신 분 연락주세요', 'active', false, 6, 2, 20, 8.0, false, NOW() - INTERVAL '4 hours', NOW()),
                                                                                                                                                                                    (12, 6, 'share', '🪴 화분 나눔해요', '이사 가면서 못 가져가는 화분 나눔합니다', 'active', false, 8, 4, 28, 12.0, false, NOW() - INTERVAL '5 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (11, 6, 'lifestyle', '🔑 출입문 비밀번호 변경', '1층 출입문 비밀번호 언제 변경됐나요?', 'active', false, 10, 5, 30, 15.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (13, 6, 'lifestyle', '📦 택배함 위치 문의', '택배함이 어디에 있나요? 처음 와서 잘 모르겠어요', 'active', false, 9, 4, 26, 13.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
    (12, 6, 'chat', '🏃 여의도공원 조깅 같이 하실 분', '아침에 여의도공원에서 조깅 같이 하실 분 모집해요!', 'active', false, 8, 3, 24, 11.0, false, NOW() - INTERVAL '4 hours', NOW());

-- ============================================
-- 목동 526-11 (buildingId=7) - 10개 게시글
-- ============================================

-- 같이 사요 (4개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (14, 7, 'togather', '🍗 치킨 같이 시킬 분 (201동)', '교촌치킨 2마리 시키면 할인돼요. 같이 시킬 분?', 'active', false, 14, 7, 42, 21.0, true, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (15, 7, 'togather', '🥤 편의점 행사 같이 해요 (202동)', 'CU 2+1 행사 중이래요. 같이 사실 분?', 'active', false, 12, 5, 36, 17.0, false, NOW() - INTERVAL '2 hours', NOW()),
                                                                                                                                                                                    (16, 7, 'togather', '🍕 피자 공동구매 (201동)', '피자헛 2판 시키면 배달비 무료예요', 'active', false, 16, 9, 48, 25.0, true, NOW() - INTERVAL '30 minutes', NOW()),
                                                                                                                                                                                    (17, 7, 'togather', '🥩 고기 같이 사요 (203동)', '마트에서 고기 대량 구매하실 분?', 'active', false, 10, 4, 30, 14.0, false, NOW() - INTERVAL '3 hours', NOW());

-- 나눔 (3개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (14, 7, 'share', '📦 아기 장난감 나눔 (201동)', '아이가 안 쓰는 장난감 나눔해요', 'active', false, 9, 3, 28, 12.0, false, NOW() - INTERVAL '4 hours', NOW()),
                                                                                                                                                                                    (15, 7, 'share', '📚 책 나눔합니다 (202동)', '소설책 5권 정도 드려요', 'active', false, 7, 2, 22, 9.0, false, NOW() - INTERVAL '5 hours', NOW()),
                                                                                                                                                                                    (16, 7, 'share', '🪴 화분 나눔 (201동)', '화분 몇 개 나눔해요', 'active', false, 8, 4, 26, 12.0, false, NOW() - INTERVAL '6 hours', NOW());

-- ZIP 생활 (2개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
                                                                                                                                                                                    (15, 7, 'lifestyle', '🛠 엘리베이터 점검 일정', '202동 엘리베이터 점검 언제 하나요?', 'active', false, 13, 8, 40, 21.0, false, NOW() - INTERVAL '1 hour', NOW()),
                                                                                                                                                                                    (17, 7, 'lifestyle', '🚗 주차장 이용 문의', '203동 주차장 이용 방법 알려주세요', 'active', false, 11, 6, 34, 17.0, false, NOW() - INTERVAL '2 hours', NOW());

-- 잡담 (1개)
INSERT INTO posts ("authorId", "buildingId", "boardType", title, content, status, "isCommercial", "likeCount", "commentCount", "viewCount", "hotScore", "isHot", "createdAt", "updatedAt") VALUES
    (14, 7, 'chat', '🐱 단지 고양이 보신 분?', '목동공원 쪽에 고양이 보신 분 계신가요?', 'active', false, 15, 10, 45, 25.0, true, NOW() - INTERVAL '2 hours', NOW());

-- ============================================
-- 추가 댓글 데이터
-- ============================================

-- 여의도 유화증권 게시글 댓글
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
-- 게시글 30번 (점심 도시락)
(30, 12, '저도 참여하고 싶어요!', NULL, 2, NOW() - INTERVAL '1 hour 55 minutes', NOW()),
(30, 13, '시간 언제로 할까요?', NULL, 1, NOW() - INTERVAL '1 hour 50 minutes', NOW()),
(30, 11, '오후 12시로 하면 어떨까요?', 2, 1, NOW() - INTERVAL '1 hour 45 minutes', NOW()),

-- 게시글 33번 (피자)
(33, 12, '저도 끼워주세요!', NULL, 2, NOW() - INTERVAL '55 minutes', NOW()),
(33, 11, '좋아요! 몇 시로 할까요?', NULL, 1, NOW() - INTERVAL '50 minutes', NOW());

-- 목동 526-11 게시글 댓글
INSERT INTO comments ("postId", "authorId", content, "parentCommentId", "likeCount", "createdAt", "updatedAt") VALUES
-- 게시글 37번 (치킨)
(37, 15, '202동인데 저도 참여하고 싶어요!', NULL, 3, NOW() - INTERVAL '55 minutes', NOW()),
(37, 16, '201동이에요. 저도요!', NULL, 2, NOW() - INTERVAL '50 minutes', NOW()),
(37, 17, '203동입니다. 시간 언제로 할까요?', NULL, 1, NOW() - INTERVAL '45 minutes', NOW()),
(37, 14, '오늘 저녁 7시 어떠세요?', 3, 2, NOW() - INTERVAL '40 minutes', NOW()),

-- 게시글 39번 (피자)
(39, 15, '202동이에요. 저도 참여합니다!', NULL, 2, NOW() - INTERVAL '25 minutes', NOW()),
(39, 17, '203동인데 페퍼로니 가능한가요?', NULL, 1, NOW() - INTERVAL '20 minutes', NOW()),
(39, 16, '네 좋아요!', 6, 1, NOW() - INTERVAL '15 minutes', NOW()),

-- 게시글 45번 (고양이)
(45, 15, '어제 목동공원에서 봤어요!', NULL, 4, NOW() - INTERVAL '1 hour 55 minutes', NOW()),
(45, 16, '저도 봤어요. 귀여워요', NULL, 3, NOW() - INTERVAL '1 hour 50 minutes', NOW()),
(45, 17, '사진 찍으셨나요?', NULL, 1, NOW() - INTERVAL '1 hour 45 minutes', NOW());

-- ============================================
-- 추가 게시글 좋아요 데이터 (post_likes 테이블)
-- ============================================

INSERT INTO post_likes ("userId", "postId", "createdAt") VALUES
-- 여의도 유화증권 게시글 좋아요
(12, 30, NOW() - INTERVAL '2 hours'),
(13, 30, NOW() - INTERVAL '1 hour 55 minutes'),
(11, 33, NOW() - INTERVAL '1 hour'),
(12, 33, NOW() - INTERVAL '55 minutes'),
(13, 33, NOW() - INTERVAL '50 minutes'),

-- 목동 526-11 게시글 좋아요
(15, 37, NOW() - INTERVAL '1 hour'),
(16, 37, NOW() - INTERVAL '55 minutes'),
(17, 37, NOW() - INTERVAL '50 minutes'),
(14, 37, NOW() - INTERVAL '45 minutes'),
(15, 39, NOW() - INTERVAL '30 minutes'),
(16, 39, NOW() - INTERVAL '25 minutes'),
(17, 39, NOW() - INTERVAL '20 minutes'),
(14, 39, NOW() - INTERVAL '15 minutes'),
(15, 45, NOW() - INTERVAL '2 hours'),
(16, 45, NOW() - INTERVAL '1 hour 55 minutes'),
(17, 45, NOW() - INTERVAL '1 hour 50 minutes'),
(14, 45, NOW() - INTERVAL '1 hour 45 minutes');
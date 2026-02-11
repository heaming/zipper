-- 데이터베이스 초기화 스크립트
-- 모든 테이블과 제약조건을 삭제하고 새로 생성합니다.

-- 외래키 제약조건을 먼저 삭제하기 위해 CASCADE 사용
DROP TABLE IF EXISTS "likes" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "chat_messages" CASCADE;
DROP TABLE IF EXISTS "chat_room_members" CASCADE;
DROP TABLE IF EXISTS "chat_rooms" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "building_memberships" CASCADE;
DROP TABLE IF EXISTS "residence_verifications" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "buildings" CASCADE;

-- Enum 타입들도 삭제 (존재하는 경우)
DROP TYPE IF EXISTS "building_memberships_status_enum" CASCADE;
DROP TYPE IF EXISTS "buildings_buildingtype_enum" CASCADE;
DROP TYPE IF EXISTS "chat_rooms_roomtype_enum" CASCADE;
DROP TYPE IF EXISTS "chat_messages_messagetype_enum" CASCADE;
DROP TYPE IF EXISTS "residence_verifications_verificationtype_enum" CASCADE;
DROP TYPE IF EXISTS "residence_verifications_status_enum" CASCADE;
DROP TYPE IF EXISTS "notifications_type_enum" CASCADE;

-- 완료 메시지
SELECT 'Database reset completed. Restart the backend server to recreate tables.' AS message;

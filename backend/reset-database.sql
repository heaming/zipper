-- 데이터베이스 초기화 스크립트
-- 모든 테이블과 제약조건을 삭제하고 새로 생성합니다.

-- 먼저 모든 인덱스를 삭제 (테이블 삭제 전에 인덱스를 먼저 삭제)
-- TypeORM이 생성하는 인덱스가 테이블 삭제 후에도 남아있을 수 있으므로 먼저 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 모든 인덱스 찾아서 삭제 (public 스키마의 모든 인덱스)
    FOR r IN (
        SELECT schemaname, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
    ) 
    LOOP
        BEGIN
            EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.schemaname) || '.' || quote_ident(r.indexname) || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
            -- 인덱스가 이미 삭제되었거나 존재하지 않는 경우 무시
            NULL;
        END;
    END LOOP;
END $$;

-- 특정 인덱스가 남아있는 경우를 대비해 명시적으로 삭제 시도
DROP INDEX IF EXISTS "IDX_97c47962541d9faa1070208829" CASCADE;

-- 외래키 제약조건을 먼저 삭제하기 위해 CASCADE 사용
-- 의존성 순서에 따라 삭제 (자식 테이블부터 부모 테이블 순서)
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "user_activities" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "post_meta" CASCADE;
DROP TABLE IF EXISTS "post_images" CASCADE;
DROP TABLE IF EXISTS "post_likes" CASCADE;
DROP TABLE IF EXISTS "likes" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "chat_messages" CASCADE;
DROP TABLE IF EXISTS "chat_room_members" CASCADE;
DROP TABLE IF EXISTS "chat_rooms" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "building_memberships" CASCADE;
DROP TABLE IF EXISTS "building_verifications" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "buildings" CASCADE;

-- Enum 타입들도 삭제 (존재하는 경우)
-- CASCADE를 사용하여 의존성 있는 모든 객체도 함께 삭제
DROP TYPE IF EXISTS "posts_boardtype_enum" CASCADE;
DROP TYPE IF EXISTS "posts_status_enum" CASCADE;
DROP TYPE IF EXISTS "building_memberships_status_enum" CASCADE;
DROP TYPE IF EXISTS "building_verifications_verificationtype_enum" CASCADE;
DROP TYPE IF EXISTS "building_verifications_status_enum" CASCADE;
DROP TYPE IF EXISTS "chat_rooms_roomtype_enum" CASCADE;
DROP TYPE IF EXISTS "chat_messages_messagetype_enum" CASCADE;
DROP TYPE IF EXISTS "notifications_type_enum" CASCADE;
DROP TYPE IF EXISTS "reports_targettype_enum" CASCADE;
DROP TYPE IF EXISTS "reports_reason_enum" CASCADE;

-- 시퀀스(Sequence) 명시적으로 삭제하여 ID 값 리셋
-- TypeORM이 생성하는 시퀀스는 {table_name}_id_seq 형식
DROP SEQUENCE IF EXISTS "reports_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "user_activities_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "user_profiles_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "post_meta_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "post_images_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "post_likes_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "likes_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "comments_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "chat_messages_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "chat_room_members_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "chat_rooms_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "posts_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "notifications_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "building_memberships_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "building_verifications_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "users_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "buildings_id_seq" CASCADE;


-- 완료 메시지
SELECT 'Database reset completed. Restart the backend server to recreate tables.' AS message;

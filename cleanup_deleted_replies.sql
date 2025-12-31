-- Soft delete된 댓글들 중 자식이 모두 삭제된 댓글들을 완전히 삭제하는 SQL 스크립트
-- 주의: 이 스크립트를 실행하기 전에 데이터베이스를 백업하세요!

-- 1. 자식이 모두 삭제된 soft delete 댓글들 찾기 (확인용)
SELECT r.id, r.content, r.is_deleted, 
       (SELECT COUNT(*) FROM replies WHERE parent_id = r.id AND is_deleted = false) as active_children_count
FROM replies r
WHERE r.is_deleted = true
AND (SELECT COUNT(*) FROM replies WHERE parent_id = r.id AND is_deleted = false) = 0;

-- 2. 실제 삭제 실행 (위 쿼리로 확인 후 실행)
-- DELETE FROM replies
-- WHERE is_deleted = true
-- AND (SELECT COUNT(*) FROM replies WHERE parent_id = replies.id AND is_deleted = false) = 0;

-- 참고: MySQL에서는 위 DELETE 쿼리가 동일한 테이블을 참조하기 때문에 오류가 발생할 수 있습니다.
-- 아래 방법을 사용하세요:

-- 방법 1: 임시 테이블 사용
-- CREATE TEMPORARY TABLE temp_deleted_replies AS
-- SELECT r.id
-- FROM replies r
-- WHERE r.is_deleted = true
-- AND (SELECT COUNT(*) FROM replies WHERE parent_id = r.id AND is_deleted = false) = 0;
-- 
-- DELETE FROM replies WHERE id IN (SELECT id FROM temp_deleted_replies);
-- DROP TEMPORARY TABLE temp_deleted_replies;

-- 방법 2: 서브쿼리로 ID 목록 먼저 확인 후 삭제
-- DELETE FROM replies
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT r.id
--         FROM replies r
--         WHERE r.is_deleted = true
--         AND (SELECT COUNT(*) FROM replies WHERE parent_id = r.id AND is_deleted = false) = 0
--     ) AS temp
-- );


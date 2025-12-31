package return7.boardbackend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import return7.boardbackend.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    List<Reply> findByBoardIdOrderByIdDesc(Long boardId, Pageable pageable);
    
    // FE 작업중 수정 : 오름차순 조회 메서드 추가 (기본순 정렬용)
    List<Reply> findByBoardIdOrderByIdAsc(Long boardId, Pageable pageable);

    List<Reply> findByBoardIdOrderByRecommendationDescIdDesc(Long boardId, Pageable pageable);

    List<Reply> findByBoardIdAndIdLessThanOrderByIdDesc(Long boardId, Long cursorId, Pageable pageable);
    
    // FE 작업중 수정 : 오름차순 커서 기반 조회 메서드 추가 (기본순 정렬용)
    List<Reply> findByBoardIdAndIdGreaterThanOrderByIdAsc(Long boardId, Long cursorId, Pageable pageable);

    Optional<Reply> findByBoardIdAndIsSelectedTrue(Long boardId);
    
    // FE 작업중 수정 : 부모 댓글의 삭제되지 않은 자식 개수 조회 메서드 추가 (부모 자동 삭제 로직용)
    @Query("SELECT COUNT(r) FROM Reply r WHERE r.parent.id = :parentId AND r.isDeleted = false")
    long countByParentIdAndIsDeletedFalse(@Param("parentId") Long parentId);
    
    // FE 작업중 수정 : Soft delete된 모든 댓글 조회 메서드 추가 (cleanup 기능용)
    @Query("SELECT r FROM Reply r WHERE r.isDeleted = true")
    List<Reply> findAllDeletedReplies();

    @Query("SELECT r FROM Reply r " +
            "WHERE r.board.id = :boardId " +
            "AND (" +
            "   r.recommendation < :cursorRecCount " +
            "   OR " +
            "   (r.recommendation = :cursorRecCount AND r.id < :cursorId) " +
            ") " +
            "ORDER BY r.recommendation DESC, r.id DESC")
    List<Reply> findByBest(@Param("boardId") Long boardId,
                           @Param("cursorRecCount") int cursorScore,
                           @Param("cursorId") Long cursorId,
                           Pageable pageable);
}

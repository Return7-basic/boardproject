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

    List<Reply> findByBoardIdOrderByRecommendationDescIdDesc(Long boardId, Pageable pageable);

    List<Reply> findByBoardIdAndIdLessThanOrderByIdDesc(Long boardId, Long cursorId, Pageable pageable);

    Optional<Reply> findByBoardIdAndIsSelectedTrue(Long boardId);

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

package return7.boardbackend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import return7.boardbackend.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
    List<Reply> findByBoardId(Long boardId);

    List<Reply> findByBoardIdOrderByIdDesc(Long boardId, Pageable pageable);

    List<Reply> findByBoardIdAndIdLessThanOrderByIdDesc(Long boardId, Long cursorId, Pageable pageable);

    Optional<Reply> findByBoardIdAndIsSelectedTrue(Long boardId);
}

package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Reply;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
    List<Reply> findByBoardId(Long boardId);
}

package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
}

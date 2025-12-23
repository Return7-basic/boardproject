package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
}

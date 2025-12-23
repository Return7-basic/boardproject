package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.Reply;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {
}

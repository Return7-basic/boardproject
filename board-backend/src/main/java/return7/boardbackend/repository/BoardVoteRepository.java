package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.BoardVote;
import return7.boardbackend.entity.User;

import java.util.Optional;

public interface BoardVoteRepository extends JpaRepository<BoardVote, Long> {
    /**
     * 유저 게시글에 투표한 전체 정보
     */
    Optional<BoardVote> findByBoardAndUser(Board board, User user);
}

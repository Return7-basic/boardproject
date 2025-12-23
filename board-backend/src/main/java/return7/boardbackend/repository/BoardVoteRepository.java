package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.BoardVote;
import return7.boardbackend.entity.User;
import return7.boardbackend.entity.VoteType;

import java.util.Optional;

public interface BoardVoteRepository extends JpaRepository<BoardVote, Long> {

    //유저가 게시글에 이미 투표 여부
    boolean existsByBoardAndUser(Board board, User user);

    //유적 게시글에 투표를 한 전체 정보.
    Optional<BoardVote> findByBoardAndUser(Board board, User user);

    long countByBoardAndVoteType(Board board, VoteType voteType);

}

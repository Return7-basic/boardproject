package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.Reply;
import return7.boardbackend.entity.ReplyVote;
import return7.boardbackend.entity.User;

import java.util.Optional;

public interface ReplyVoteRepository extends JpaRepository<ReplyVote, Long> {

    Optional<ReplyVote> findByReplyAndUser(Reply reply, User user);
}

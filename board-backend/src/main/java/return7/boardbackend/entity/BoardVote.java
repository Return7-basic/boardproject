package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@Table(
        name = "board_vote",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "board_id"})//뭐가문제였지?
}
)
public class BoardVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private VoteType voteType;

    protected BoardVote(){}//NoArgsConstructor대신(외부new차단)

    public BoardVote(User user, Board board, VoteType voteType){
        this.user=user;
        this.board= board;
        this.voteType=voteType;
    }

    public void changeVote(VoteType voteType){
        this.voteType=voteType;
    }

}

package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import return7.boardbackend.enums.VoteType;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "board_vote",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"user_id", "board_id"})
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

    public BoardVote(User user, Board board, VoteType voteType){
        this.user=user;
        this.board= board;
        this.voteType=voteType;
    }

    public void changeVote(VoteType voteType){
        this.voteType=voteType;
    }

}

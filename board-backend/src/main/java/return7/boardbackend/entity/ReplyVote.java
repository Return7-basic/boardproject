package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(
        name = "reply_vote",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "reply_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ReplyVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id", nullable = false)
    private Reply reply;

    // 추천,비추천 구분 상태 필드
    // 제
    private boolean voted;

    public ReplyVote(User user, Reply reply, boolean voted) {
        this.user = user;
        this.reply = reply;
        this.voted = voted;
    }
}

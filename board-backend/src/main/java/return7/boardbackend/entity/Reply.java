package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import return7.boardbackend.enums.VoteType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "replies")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String content;

    @Builder.Default
    private boolean isSelected = false;

    @Builder.Default
    private boolean isDeleted = false;

    @Builder.Default
    private int recommendation = 0;

    @Builder.Default
    private int disrecommendation = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    private User writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Reply parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> children = new ArrayList<>();

    @OneToMany(mappedBy = "reply", cascade = CascadeType.REMOVE)
    private List<ReplyVote> votes = new ArrayList<>();

    public void applyVote(VoteType type) {
        if (type == VoteType.UP) {
            recommendation++;
        } else {
            disrecommendation++;
        }
    }

    public void cancelVote(VoteType type) {
        if (type == VoteType.UP) {
            recommendation--;
        } else {
            disrecommendation--;
        }
    }

    public void changeVote(VoteType from, VoteType to) {
        cancelVote(from);
        applyVote(to);
    }

    public void setUser(User writer) {
        this.writer = writer;
    }
}

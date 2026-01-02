package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import return7.boardbackend.enums.VoteType;
import return7.boardbackend.exception.ReplyAlreadyAcceptedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String title;

    @Column(nullable = false)
    private String content;
    private int viewCount;

    private int upCount;
    private int downCount;

    @Column(nullable = false)
    @Builder.Default
    private boolean selected=false;

    /**채택된 댓글 참조*/
    @OneToOne
    @JoinColumn(name="selected_reply_id")
    private Reply selectedReply;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> replies = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true) // 만약 탈퇴해도 글을 남기고 싶다면
    private User writer;

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE)
    private List<BoardVote> votes = new ArrayList<>();

    public void update(String title,String content){
        this.title=title;
        this.content=content;
    }
    public void increaseViewCount(){
        this.viewCount++;
    }

    public void applyVote(VoteType type) {
        if (type == VoteType.UP) {
            upCount++;
        } else {
            downCount++;
        }
    }

    public void cancelVote(VoteType type) {
        if (type == VoteType.UP) {
            upCount--;
        } else {
            downCount--;
        }
    }

    public void changeVote(VoteType from, VoteType to) {
        cancelVote(from);
        applyVote(to);
    }

    public void selectReply(Reply reply) {
        if(this.selected) {
            throw new ReplyAlreadyAcceptedException("이미 채택된 댓글이 있습니다.");
        }
        this.selected=true;
        this.selectedReply=reply;
    }

    public void setUser(User writer) {
        this.writer = writer;
    }
}
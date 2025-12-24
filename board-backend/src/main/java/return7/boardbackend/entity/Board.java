package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import return7.boardbackend.enums.VoteType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder //추후 확인
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

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> replies = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private User writer;

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


}
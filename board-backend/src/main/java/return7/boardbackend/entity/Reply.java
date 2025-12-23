package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 답글 Entity
 */
@Entity
@Table(name = "replys")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder // 추후 확인
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
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    private User writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Reply parent;


}

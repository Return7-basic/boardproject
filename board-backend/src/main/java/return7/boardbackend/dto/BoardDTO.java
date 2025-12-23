package return7.boardbackend.dto;

import lombok.*;
import return7.boardbackend.entity.Board;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardDTO {

    private Long id;
    private String title;
    private String content;

    private int viewCount;
    private int recommendation;

    private String writerLoginId;
    private String writerNickname;
    private LocalDateTime createdAt;

    public static BoardDTO from(Board board){
        return BoardDTO.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .viewCount(board.getViewCount())
                .recommendation(board.getRecommendation())
                .writerLoginId(board.getWriter().getLoginId())
                .writerNickname(board.getWriter().getNickName())
                .createdAt(board.getCreatedAt())
                .build();
    }
}

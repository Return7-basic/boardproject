package return7.boardbackend.dto.board;

import lombok.*;
import return7.boardbackend.entity.Board;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardDto {

    private Long id;
    private String title;
    private String content;

    private int viewCount;
    private int upCount;
    private int downCount;
    private int replyCount;
    private boolean replySelected;

    private String writerLoginId;
    private String writerNickname;
    private LocalDateTime createdAt;

    public static BoardDto from(Board board){
        // 삭제되지 않은 댓글 수 계산
        int replyCount = (int) board.getReplies().stream()
                .filter(reply -> !reply.isDeleted())
                .count();
        
        return BoardDto.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .viewCount(board.getViewCount())
                .upCount(board.getUpCount())
                .downCount(board.getDownCount())
                .replyCount(replyCount)
                .replySelected(board.isSelected())
                .createdAt(board.getCreatedAt())

                .writerLoginId(board.getWriter()!=null?board.getWriter().getLoginId():"삭제된 사용자")
                .writerNickname(board.getWriter()!=null?board.getWriter().getNickname():"삭제된 사용자")

                .build();
    }
}

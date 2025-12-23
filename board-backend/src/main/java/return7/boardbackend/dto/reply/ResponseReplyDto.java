package return7.boardbackend.dto.reply;

import lombok.*;
import return7.boardbackend.entity.Reply;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseReplyDto {
    private Long id;
    private String content;

    private boolean isSelected;
    private int recommendation;
    private int disrecommendation;

    private LocalDateTime createdAt;
    private Long boardId;
    private Long writerId;
    private Long parentId;

    public static ResponseReplyDto from(Reply reply) {
        return  ResponseReplyDto.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .isSelected(reply.isSelected())
                .recommendation(reply.getRecommendation())
                .disrecommendation(reply.getDisrecommendation())
                .createdAt(reply.getCreatedAt())
                .boardId(reply.getBoard() != null ? reply.getBoard().getId() : null)
                .writerId(reply.getWriter() != null ? reply.getWriter().getId() : null)
                .parentId(reply.getParent() != null ? reply.getParent().getId() : null)
                .build();
    }
}

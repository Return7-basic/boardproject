package return7.boardbackend.dto.reply;

import lombok.Getter;

@Getter
public class SelectedReplyDto {
    private Long replyId;

    private String replyContent;

    public SelectedReplyDto(Long replyId, String replyContent) {
        this.replyId = replyId;
        this.replyContent = replyContent;
    }
}

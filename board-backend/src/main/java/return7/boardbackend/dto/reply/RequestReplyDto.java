package return7.boardbackend.dto.reply;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestReplyDto {
    private Long id;
    private Long boardId;
    private Long parentId;
    private String content;
}

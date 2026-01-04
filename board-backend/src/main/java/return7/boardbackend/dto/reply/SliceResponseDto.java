package return7.boardbackend.dto.reply;

import java.util.List;

public record SliceResponseDto
    (List<ResponseReplyDto> items,
    boolean hasNext,
    long nextCursor,
    Integer nextScore) {}

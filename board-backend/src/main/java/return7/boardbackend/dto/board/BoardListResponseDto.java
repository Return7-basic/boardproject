package return7.boardbackend.dto.board;

import java.util.List;

public record BoardListResponseDto(
    List<BoardDto> items,
    boolean hasNext
) {}


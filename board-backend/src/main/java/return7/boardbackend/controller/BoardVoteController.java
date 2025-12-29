package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.BoardVoteService;
import return7.boardbackend.enums.VoteType;

@RestController
@RequestMapping("/api/boards/{boardId}")
@RequiredArgsConstructor
public class BoardVoteController {
    private final BoardVoteService boardVoteService;

    /**
     * 게시글 추천 Api
     */
    @PostMapping("/up")
    public void upVote(@PathVariable Long boardId, @AuthenticationPrincipal CustomPrincipal customPrincipal){
        Long loginId = customPrincipal.getUserId();
        boardVoteService.vote(boardId, loginId, VoteType.UP);
    }

    /**
     * 게시글 비추천 Api
     */
    @PostMapping("/down")
    public void downVote(@PathVariable Long boardId,@AuthenticationPrincipal CustomPrincipal customPrincipal){
        Long loginId = customPrincipal.getUserId();
        boardVoteService.vote(boardId, loginId, VoteType.DOWN);
    }
}

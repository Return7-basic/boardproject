package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.BoardVoteService;
import return7.boardbackend.enums.VoteType;

import java.util.Map;

@RestController
@RequestMapping("/api/boards/{boardId}")
@RequiredArgsConstructor
public class BoardVoteController {
    private final BoardVoteService boardVoteService;

    /**
     * 게시글 추천 Api
     */
    @PostMapping("/up")
    public ResponseEntity<Map<String, Integer>> upVote(@PathVariable Long boardId, @AuthenticationPrincipal CustomPrincipal customPrincipal){
        Long loginId = customPrincipal.getUserId();
        Map<String, Integer> result = boardVoteService.vote(boardId, loginId, VoteType.UP);
        return ResponseEntity.ok(result);
    }

    /**
     * 게시글 비추천 Api
     */
    @PostMapping("/down")
    public ResponseEntity<Map<String, Integer>> downVote(@PathVariable Long boardId,@AuthenticationPrincipal CustomPrincipal customPrincipal){
        Long loginId = customPrincipal.getUserId();
        Map<String, Integer> result = boardVoteService.vote(boardId, loginId, VoteType.DOWN);
        return ResponseEntity.ok(result);
    }
}

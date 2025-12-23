package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.repository.BoardVoteRepository;
import return7.boardbackend.service.BoardVoteService;
import return7.boardbackend.entity.VoteType;

@RestController
@RequestMapping("/api/boards/{boardId}/votes")
@RequiredArgsConstructor
public class BoardVoteController {
    private final BoardVoteService boardVoteService;

    //추천
    @PostMapping("up")
    public void upVote(@PathVariable Long boardId,
                        @RequestHeader("UserLoginId example") String loginId // 임시용
    ){
        boardVoteService.vote(boardId, loginId, VoteType.UP);
    }
    //비추천
    @PostMapping("down")
    public void downVote(@PathVariable Long boardId,
                        @RequestHeader("UserLoginId example")String loginId){
        boardVoteService.vote(boardId, loginId, VoteType.DOWN);
    }
}

package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.config.CustomUserDetails;
import return7.boardbackend.dto.reply.RequestReplyDto;
import return7.boardbackend.dto.reply.ResponseReplyDto;
import return7.boardbackend.enums.VoteResult;
import return7.boardbackend.service.ReplyService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/replies")
@RequiredArgsConstructor
public class ReplyController {
    private final ReplyService replyService;

    /**
     * 댓글 작성 Api
     * */
    @PostMapping
    public ResponseEntity<ResponseReplyDto> createReply(
            @RequestBody RequestReplyDto reqReplyDto,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        ResponseReplyDto resReplyDto = replyService.create(reqReplyDto, customUserDetails);
        return ResponseEntity.ok(resReplyDto);
    }

    /**
     * 댓글 수정 Api
     */
    @PatchMapping("/update")
    public ResponseEntity<ResponseReplyDto> updateReply(
            @RequestBody ResponseReplyDto replyDto,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        ResponseReplyDto update = replyService.update(replyDto, customUserDetails);
        return ResponseEntity.ok(update);
    }

    /**
     * soft 삭제
     */
    @PatchMapping("/softDelete")
    public ResponseEntity<ResponseReplyDto> softDeleteReply(
            @RequestBody RequestReplyDto replyDto,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        ResponseReplyDto delete = replyService.delete(replyDto.getId(), customUserDetails);
        return ResponseEntity.ok(delete);
    }

    /**
     * hard 삭제
     */
    @DeleteMapping("/{replyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReply(@PathVariable Long replyId,
                            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        replyService.deleteHard(replyId, customUserDetails);
    }

    /**
     * 전체 댓글 조회
     */
    @GetMapping()
    public ResponseEntity<List<ResponseReplyDto>> getReply(@PathVariable Long boardId){
        List<ResponseReplyDto> replyByBoard = replyService.getReplyByBoard(boardId);
        return ResponseEntity.ok(replyByBoard);
    }

    /**
     * 댓글 채택 Api
     */
    @PostMapping("/{replyId}/select")
    public ResponseEntity<Boolean> selectReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        boolean result = replyService.selectReply(replyId, customUserDetails);
        return ResponseEntity.ok(result);

    }

    /**
     * 추천 누르기
     */
    @PostMapping("/{replyId}/vote")
    public ResponseEntity<VoteResult> voteReply(@PathVariable Long replyId, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return ResponseEntity.ok(replyService.voteReply(replyId, customUserDetails));
    }


    /**
     * 비추천 누르기
     */
    @PostMapping("/{replyId}/downvote")
    public ResponseEntity<VoteResult> downVoteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return ResponseEntity.ok(replyService.downVoteReply(replyId, customUserDetails));
    }
}

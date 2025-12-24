package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.security.CustomUserDetails;
import return7.boardbackend.dto.reply.RequestReplyDto;
import return7.boardbackend.dto.reply.ResponseReplyDto;
import return7.boardbackend.dto.reply.SliceResponseDto;
import return7.boardbackend.enums.VoteType;
import return7.boardbackend.service.ReplyService;

@RestController
@RequestMapping("/api/boards/{boardId}/replies")
@RequiredArgsConstructor
public class ReplyController {
    private final ReplyService replyService;

    // page기능 어떡할지 ? - 100개 단위로 쪼개기
    // 대댓글 접기 여부 백엔드? 프론트?

    /**
     * 댓글 작성 Api
     */
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
    public ResponseEntity<SliceResponseDto> getReply(
            @PathVariable Long boardId,
            @RequestParam(required = false) Long cursorId,
            @RequestParam(defaultValue = "100")int size){
        SliceResponseDto result = replyService.getReplyByBoard(boardId, cursorId, size);
        return ResponseEntity.ok(result);
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
    @PostMapping("/{replyId}/up")
    public ResponseEntity<VoteType> voteReply(@PathVariable Long replyId, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return ResponseEntity.ok(replyService.voteReply(replyId, customUserDetails));
    }


    /**
     * 비추천 누르기
     */
    @PostMapping("/{replyId}/down")
    public ResponseEntity<VoteType> downVoteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return ResponseEntity.ok(replyService.downVoteReply(replyId, customUserDetails));
    }
    
    /**
     * 채택된 댓글 조회 - boardId
     */
    @GetMapping("/selected")
    public ResponseEntity<ResponseReplyDto> getSelectedReply (@PathVariable Long boardId) {
        return ResponseEntity.ok(replyService.getSelectedReply(boardId));
    }
}

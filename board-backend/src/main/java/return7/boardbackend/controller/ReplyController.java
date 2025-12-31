package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.reply.RequestReplyDto;
import return7.boardbackend.dto.reply.ResponseReplyDto;
import return7.boardbackend.dto.reply.SliceResponseDto;
import return7.boardbackend.enums.VoteType;
import return7.boardbackend.service.BoardService;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.ReplyService;

@RestController
@RequestMapping("/api/boards/{boardId}/replies")
@RequiredArgsConstructor
public class ReplyController {
    private final ReplyService replyService;
    private final BoardService boardService;

    /**
     * 댓글 작성 Api
     */
    @PostMapping
    public ResponseEntity<ResponseReplyDto> createReply(
            @PathVariable Long boardId,
            @RequestBody RequestReplyDto reqReplyDto,
            @AuthenticationPrincipal CustomPrincipal customPrincipal
    ) {
        ResponseReplyDto resReplyDto = replyService.create(boardId, reqReplyDto, customPrincipal.getUserId());
        return ResponseEntity.ok(resReplyDto);
    }

    /**
     * 댓글 수정 Api
     */
    @PatchMapping("/update")
    public ResponseEntity<ResponseReplyDto> updateReply(
            @PathVariable Long boardId,
            @RequestBody ResponseReplyDto replyDto,
            @AuthenticationPrincipal CustomPrincipal customPrincipal) {
        ResponseReplyDto update = replyService.update(replyDto, customPrincipal.getUserId());
        return ResponseEntity.ok(update);
    }

    /**
     * 댓글 soft & hard 삭제
     * - soft 삭제시 : Dto 전달
     * - hard 삭제시 : 본문 응답없음
     */
    @DeleteMapping("/{replyId}")
    public ResponseEntity<ResponseReplyDto> softDeleteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomPrincipal customPrincipal) {

        ResponseReplyDto delete = replyService.delete(replyId, customPrincipal.getUserId(), customPrincipal.getAuthorities());

        if(delete == null) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(delete);
        }
    }

    /**
     * 전체 댓글 조회
     */
    // FE 작업중 수정 : sort 기본값을 "latest"에서 "ascending"으로 변경 (기본순 오름차순)
    @GetMapping
    public ResponseEntity<SliceResponseDto> getReply(
            @PathVariable Long boardId,
            @RequestParam(required = false) Long cursorId,
            @RequestParam(defaultValue = "100")int size,
            @RequestParam (defaultValue = "ascending")String sort,
            @RequestParam(required = false)Integer cursorScore){
        SliceResponseDto result = replyService.getReplyByBoard(boardId, sort, cursorScore, cursorId, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 댓글 채택 Api
     */
    @PostMapping("/{replyId}/select")
    public ResponseEntity<Boolean> selectReply(
            @PathVariable Long boardId,
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomPrincipal customPrincipal
    ) {
        boolean selected = boardService.selectReply(boardId, replyId, customPrincipal.getUserId());
        return ResponseEntity.ok(selected);
    }

    /**
     * 추천 누르기
     */
    @PostMapping("/{replyId}/up")
    public ResponseEntity<VoteType> voteReply(@PathVariable Long replyId, @AuthenticationPrincipal CustomPrincipal customPrincipal) {
        return ResponseEntity.ok(replyService.voteReply(replyId, customPrincipal.getUserId()));
    }


    /**
     * 비추천 누르기
     */
    @PostMapping("/{replyId}/down")
    public ResponseEntity<VoteType> downVoteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal CustomPrincipal customPrincipal
    ) {
        return ResponseEntity.ok(replyService.downVoteReply(replyId, customPrincipal.getUserId()));
    }
    
    // FE 작업중 수정 : 채택된 댓글이 없을 때 404 반환하도록 Optional 처리 추가
    /**
     * 채택된 댓글 조회 - boardId
     */
    @GetMapping("/selected")
    public ResponseEntity<ResponseReplyDto> getSelectedReply (@PathVariable Long boardId) {
        return replyService.getSelectedReply(boardId)
                .map(ResponseReplyDto -> ResponseEntity.ok(ResponseReplyDto))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // FE 작업중 수정 : Soft delete된 댓글들 정리 엔드포인트 추가 (관리자만 사용 가능)
    /**
     * Soft delete된 댓글들 정리 (관리자만 사용 가능)
     * 자식이 모두 삭제된 soft delete 댓글들을 완전히 삭제
     * boardId는 무시됨 (전체 댓글 정리)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Integer> cleanupDeletedReplies(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomPrincipal customPrincipal) {
        // 관리자 권한 확인
        boolean isAdmin = customPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).build();
        }
        
        int deletedCount = replyService.cleanupDeletedReplies();
        return ResponseEntity.ok(deletedCount);
    }
}

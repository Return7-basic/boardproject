package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.config.CustomUserDetails;
import return7.boardbackend.dto.BoardDTO;
import return7.boardbackend.service.BoardService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    /**게시글 작성*/
    @PostMapping
    public Long createBoard(@RequestBody BoardDTO dto){
       return boardService.createBoard(dto);
    }

    /**게시글 상세 조회(조회수 증가)*/
    @GetMapping("/{boardId}")
    public BoardDTO getBoard(@PathVariable Long boardId){
        return boardService.findById(boardId);
    }

    //게시글 목록 조회
    @GetMapping
    public List<BoardDTO> getBoards(
            @RequestParam(defaultValue = "0")int page,//page=0 ->1페이지
            @RequestParam(defaultValue = "10") int size//10개씩출력
    ){
        return boardService.findAll(page,size);
    }

    /**게시글 수정*/
    @PutMapping("/{boardId}")
    public void updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardDTO dto,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
            ){
        // Long loginUserId=1L;//임시로 로그인한 유저 추후에바뀌어야함.Long loginUserId = SecurityUtil.getCurrentUserId();
        Long loginUserId = customUserDetails.getUserId();
        boardService.updateBoard(boardId,dto,loginUserId);
    }

    /**게시글 삭제*/
    @DeleteMapping("/{boardId}")
    public void deleteBoard(@PathVariable Long boardId){
        Long loginuserId=1L;
        boardService.deleteBoard(boardId,loginuserId);

    }

    /** 게시글 댓글 채택*/
    @PostMapping("/{boardId}/replies/{replyId}/select")
    public ResponseEntity<String> selectReply(
            @PathVariable Long boardId,
            @PathVariable Long replyId) {
        boardService.selectReply(boardId, replyId);
        return ResponseEntity.ok("댓글 채택됨.");
    }

}

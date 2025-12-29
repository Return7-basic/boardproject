package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import return7.boardbackend.dto.board.BoardDto;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.BoardService;
import return7.boardbackend.service.ReplyService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;
    private final ReplyService replyService;

    /**게시글 작성*/
    @PostMapping
    public Long createBoard(@RequestBody BoardDto dto){
       return boardService.createBoard(dto);
    }

    /**게시글 상세 조회(조회수 증가)*/
    @GetMapping("/{boardId}")
    public BoardDto getBoard(@PathVariable Long boardId){
        return boardService.findById(boardId);
    }

    //게시글 목록 조회
    @GetMapping
    public List<BoardDto> getBoards(
            @RequestParam(defaultValue = "0")int page,//page=0 ->1페이지
            @RequestParam(defaultValue = "10") int size//10개씩출력
    ){
        return boardService.findAll(page,size);
    }

    /**게시글 수정*/
    @PutMapping("/{boardId}")
    public void updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardDto dto,
            @AuthenticationPrincipal CustomPrincipal customPrincipal
            ){
        Long loginUserId = customPrincipal.getUserId();
        boardService.updateBoard(boardId,dto,loginUserId);
    }

    /**게시글 삭제*/
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId,
        @AuthenticationPrincipal CustomPrincipal principal){
        boardService.deleteBoard(boardId,principal.getUserId());
        return ResponseEntity.noContent().build();

    }

}

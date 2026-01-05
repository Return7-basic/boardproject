package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.board.BoardDto;
import return7.boardbackend.dto.board.BoardListResponseDto;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.BoardService;
import return7.boardbackend.service.ReplyService;


@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    /** 게시글 작성 */
    @PostMapping
    public Long createBoard(@RequestBody BoardDto dto, @AuthenticationPrincipal CustomPrincipal customPrincipal){
       return boardService.createBoard(dto, customPrincipal.getUserId());
    }

    /** 게시글 상세 조회(조회수 증가) */
    @GetMapping("/{boardId}")
    public BoardDto getBoard(@PathVariable Long boardId){
        return boardService.findById(boardId);
    }

    // FE 작업중 수정 : 반환 타입을 List<BoardDto>에서 BoardListResponseDto로 변경
    /** 게시글 목록 조회 */
    @GetMapping
    public BoardListResponseDto getBoards(
            @RequestParam(defaultValue = "0")int page,//page=0 ->1페이지
            @RequestParam(defaultValue = "10") int size//10개씩출력
    ){
        return boardService.findAll(page,size);
    }

    /** 게시글 수정 */
    @PutMapping("/{boardId}")
    public void updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardDto dto,
            @AuthenticationPrincipal CustomPrincipal customPrincipal
            ){
        Long loginUserId = customPrincipal.getUserId();
        boardService.updateBoard(boardId,dto,loginUserId);
    }

    /** 게시글 삭제 */
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId,
        @AuthenticationPrincipal CustomPrincipal principal){
        boardService.deleteBoard(boardId,principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    /** 게시글 검색 */
    @GetMapping("/search")
    public ResponseEntity<BoardListResponseDto> searchBoard(
            @RequestParam String title,
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok(boardService.searchBoard(title, page, size));
    }
}

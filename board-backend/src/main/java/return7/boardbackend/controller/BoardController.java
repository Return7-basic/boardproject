package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.BoardDTO;
import return7.boardbackend.service.BoardService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    @PostMapping//게시글 작성
    public Long createBoard(@RequestBody BoardDTO dto){
       return boardService.createBoard(dto);
    }

    //게시글 상세 조회(조회수 증가)
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

    //게시글 수정
    @PutMapping("/{boardId}")
    public void updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardDTO dto
    ){
        Long loginUserId=1L;//임시로 로그인한 유저 추후에바뀌어야함.Long loginUserId = SecurityUtil.getCurrentUserId();
        boardService.updateBoard(boardId,dto,loginUserId);
    }

    //게시글 삭제
    @DeleteMapping("/{boardId}")
    public void deleteBoard(@PathVariable Long boardId){
        Long loginuserId=1L;
        boardService.deleteBoard(boardId,loginuserId);

    }



}

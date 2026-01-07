package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.board.BoardDto;
import return7.boardbackend.dto.board.BoardListResponseDto;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.Reply;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;
import return7.boardbackend.exception.*;
import return7.boardbackend.repository.BoardRepository;
import return7.boardbackend.repository.ReplyRepository;
import return7.boardbackend.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ReplyRepository replyRepository;
    private final ReplyService replyService;

    /**
     * 게시글 생성
     */
    @Transactional
    public Long createBoard(BoardDto boardDTO, Long userId){
        User writer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("작성자를 찾을 수 없습니다."));

        Board board = Board.builder()
                .title(boardDTO.getTitle())
                .content(boardDTO.getContent())
                .writer(writer)
                .viewCount(0)
                .build();
        return boardRepository.save(board).getId();
    }

    // FE 작업중 수정 : 반환 타입을 List<BoardDto>에서 BoardListResponseDto로 변경하여 hasNext 정보 제공
    /**
     * 게시글 전체 조회
     */
    @Transactional(readOnly = true)
    public BoardListResponseDto findAll(int page, int size){//내림차순정렬.
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Board> boardPage = boardRepository.findAll(pageable);
        
        List<BoardDto> boardDtos = boardPage.getContent()
                .stream()
                .map(BoardDto::from)
                .collect(Collectors.toList());
        
        boolean hasNext = boardPage.hasNext();
        
        return new BoardListResponseDto(boardDtos, hasNext);
    }

    /**
     * 게시글 상세 조회
     * 2026-01-07 : feat - 조회 메서드 트랜잭셔널 유형 누락 수정 (쓰기->읽기)
     */
    @Transactional(readOnly = true)
    public BoardDto findById(Long boardId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        board.increaseViewCount();

        return BoardDto.from(board);
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public void updateBoard(Long boardId, BoardDto dto, Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        if(!board.getWriter().getId().equals(loginUserId)){//작성자만 수정가능하게.
            throw new WriterNotMatchException("수정 권한이 없습니다.");
        }
        String patchedTitle = board.getTitle();
        String patchedContent = board.getContent();

        if(dto.getTitle() != null) {
            patchedTitle = dto.getTitle();
        }
        if(dto.getContent() != null) {
            patchedContent = dto.getContent();
        }

        board.update(patchedTitle, patchedContent);
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deleteBoard(Long boardId,Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        User user = userRepository.findById(loginUserId)
                .orElseThrow(()->new UserNotFoundException("사용자를 찾을 수 없습니다."));

        boolean isAdmin = user.getAuthority() == Authority.ADMIN;//관리자인가?
        if(isAdmin){
            boardRepository.deleteById(boardId);
            return;
        }
        User writer = board.getWriter();
        if (writer == null) {
            throw new UserNotFoundException("삭제된 유저입니다.");
        }
        else {
            boolean isWriter = writer.getId().equals(user.getId());//작성자인가?
            if (isWriter) {
                boardRepository.deleteById(boardId);
                return;
            }
        }
    }

    /** 게시글의 댓글 채택 */
    @Transactional
    public boolean selectReply(Long boardId, Long replyId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다"));
        User loginUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("댓글을 찾을 수 없습니다"));

        if (loginUser != board.getWriter()) {
            throw new WriterNotMatchException("권한이 없습니다."); // 에러 목록 추가사항
        }

        // 댓글이 해당 게시글의 것인지 확인
        if (!reply.getBoard().getId().equals(boardId)) {
            throw new WriterNotMatchException("해당 게시글의 댓글이 아닙니다");
        }

        boolean b = replyService.selectReply(replyId, boardId, userId);
        board.selectReply(reply);

        return b;
    }

    /** 게시글 검색 기능 */
    @Transactional(readOnly = true)
    public BoardListResponseDto searchBoard(String title, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (title.length() < 2) {
            throw new MoreWordNeedException("두글자 이상 검색해주세요");
        }

        Page<Board> finded = boardRepository.findByStringLike(title, pageable);

        List<BoardDto> list = finded.stream().map(BoardDto::from).toList();
        boolean hasNext = finded.hasNext();

        return new BoardListResponseDto(list, hasNext);
    }
}
